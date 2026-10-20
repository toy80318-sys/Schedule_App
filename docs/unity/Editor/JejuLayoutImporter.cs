using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Video;
using JejuWall;

public static class JejuLayoutImporter
{
    [MenuItem("Tools/Jeju/Import Layout JSON")]
    public static void Import()
    {
        string file = EditorUtility.OpenFilePanel("Select exported layout.json inside Assets", Application.dataPath, "json");
        if (string.IsNullOrEmpty(file)) return;
        GameObject root = null;
        try
        {
            string folder = Path.GetDirectoryName(Path.GetFullPath(file));
            ProjectPath(file);
            Layout layout = JsonUtility.FromJson<Layout>(File.ReadAllText(file));
            if (layout == null || layout.format != "jeju-unity-v1" || layout.version != 1 || layout.units != "meters")
                throw new InvalidDataException("Expected jeju-unity-v1, version 1, units meters.");
            if (layout.widthMm <= 0 || layout.heightMm <= 0 || layout.objects == null || layout.assets == null)
                throw new InvalidDataException("Invalid canvas or missing arrays.");
            var media = new Dictionary<string, Sprite[]>();
            var metadata = new Dictionary<string, Media>();
            for (int i = 0; i < layout.assets.Length; i++)
            {
                Media item = layout.assets[i];
                if (item.frames == null || item.frames.Length == 0 || media.ContainsKey(item.id))
                    throw new InvalidDataException("Missing frames or duplicate asset ID.");
                EditorUtility.DisplayProgressBar("Jeju import", item.name, (float)i / Math.Max(1, layout.assets.Length));
                var frames = new Sprite[item.frames.Length];
                for (int f = 0; f < frames.Length; f++) frames[f] = LoadSprite(SafeFile(folder, item.frames[f]));
                media.Add(item.id, frames); metadata.Add(item.id, item);
            }
            string output = AssetDatabase.GenerateUniqueAssetPath(ProjectPath(folder) + "/Imported");
            Directory.CreateDirectory(output); AssetDatabase.Refresh();
            root = new GameObject("Jeju Wall - " + layout.name);
            var info = root.AddComponent<JejuWallInfo>();
            info.widthMeters = layout.widthMm / 1000f; info.heightMeters = layout.heightMm / 1000f; info.sections = layout.sections;
            var groups = new Dictionary<string, Transform>();
            foreach (Item item in layout.objects)
            {
                Transform parent = root.transform;
                if (!string.IsNullOrEmpty(item.groupId))
                {
                    if (!groups.TryGetValue(item.groupId, out parent))
                    {
                        var group = new GameObject(string.IsNullOrEmpty(item.groupName) ? item.groupId : item.groupName);
                        group.transform.SetParent(root.transform, false); parent = group.transform; groups.Add(item.groupId, parent);
                    }
                }
                CreateItem(item, parent, media, metadata);
            }
            CreateBackground(layout, folder, root.transform, output);
            if (layout.styles != null) foreach (Style style in layout.styles)
            {
                string styleFolder = output + "/" + SafeName(style.id + "_" + style.name);
                Directory.CreateDirectory(styleFolder); AssetDatabase.Refresh();
                if (style.presets == null) continue;
                foreach (Preset preset in style.presets)
                {
                    var group = new GameObject(preset.name);
                    try
                    {
                        foreach (Item item in preset.objects ?? new Item[0]) CreateItem(item, group.transform, media, metadata);
                        string path = AssetDatabase.GenerateUniqueAssetPath(styleFolder + "/" + SafeName(preset.name) + ".prefab");
                        PrefabUtility.SaveAsPrefabAsset(group, path);
                    }
                    finally { UnityEngine.Object.DestroyImmediate(group); }
                }
            }
            var cameraObject = new GameObject("Wall Preview Camera"); cameraObject.transform.SetParent(root.transform, false);
            cameraObject.transform.localPosition = new Vector3(0, 0, -10);
            var camera = cameraObject.AddComponent<Camera>(); camera.orthographic = true;
            camera.orthographicSize = layout.heightMm / 2000f; camera.aspect = layout.widthMm / layout.heightMm;
            camera.backgroundColor = new Color(.05f,.07f,.1f); camera.clearFlags = CameraClearFlags.SolidColor;
            camera.enabled = Camera.main == null; // Existing main cameras remain in control.
            Undo.RegisterCreatedObjectUndo(root, "Import Jeju Wall"); Selection.activeGameObject = root;
            AssetDatabase.SaveAssets();
            Debug.Log("Jeju import complete. Group prefabs: " + output + ". Match camera/output aspect to " + layout.widthMm + ":" + layout.heightMm);
        }
        catch (Exception ex)
        {
            if (root) UnityEngine.Object.DestroyImmediate(root);
            Debug.LogException(ex); EditorUtility.DisplayDialog("Jeju import failed", ex.Message, "OK");
        }
        finally { EditorUtility.ClearProgressBar(); }
    }
    private static GameObject CreateItem(Item item, Transform parent, Dictionary<string, Sprite[]> media, Dictionary<string, Media> metadata)
    {
        if (!media.TryGetValue(item.assetId, out Sprite[] frames)) throw new InvalidDataException("Unknown asset: " + item.assetId);
        if (!Finite(item.xMeters) || !Finite(item.yMeters) || !Finite(item.rotationZ) || !Finite(item.widthMeters) ||
            !Finite(item.heightMeters) || item.widthMeters <= 0 || item.heightMeters <= 0)
            throw new InvalidDataException("Invalid transform: " + item.id);
        var obj = new GameObject(item.name); obj.transform.SetParent(parent, false);
        obj.transform.localPosition = new Vector3(item.xMeters, item.yMeters, 0);
        obj.transform.localRotation = Quaternion.Euler(0,0,item.rotationZ);
        Vector3 size = frames[0].bounds.size;
        float scale = Mathf.Min(item.widthMeters / size.x, item.heightMeters / size.y); // CSS object-fit: contain.
        obj.transform.localScale = new Vector3(scale,scale,1);
        var renderer = obj.AddComponent<SpriteRenderer>(); renderer.sprite = frames[0]; renderer.flipX = item.flipX;
        renderer.sortingOrder = Mathf.Clamp(item.sortingOrder, -32768, 32767);
        renderer.color = new Color(1,1,1,Mathf.Clamp01(item.opacity)); // Flower RGB is already baked into PNG.
        if (frames.Length > 1) { var player = obj.AddComponent<JejuPngSequencePlayer>(); player.frames = frames; player.fps = Mathf.Max(.01f,metadata[item.assetId].fps); }
        var info = obj.AddComponent<JejuItemInfo>();
        info.editorId=item.id;info.sourceAssetId=metadata[item.assetId].sourceAssetId;info.groupId=item.groupId;
        info.styleCategoryId=item.styleCategoryId;info.stylePresetId=item.stylePresetId;info.flowerColor=item.flowerColor;
        info.editorXmm=item.editorXmm;info.editorYmm=item.editorYmm;info.boxWidthMeters=item.widthMeters;info.boxHeightMeters=item.heightMeters;
        return obj;
    }
    private static void CreateBackground(Layout layout,string folder,Transform parent,string output)
    {
        if (layout.background == null || string.IsNullOrEmpty(layout.background.image)) return;
        Sprite image=LoadSprite(SafeFile(folder,layout.background.image));
        var obj=new GameObject("Background PNG");obj.transform.SetParent(parent,false);obj.transform.localPosition=new Vector3(0,0,1);
        var renderer=obj.AddComponent<SpriteRenderer>();renderer.sprite=image;renderer.sortingOrder=-32768;
        obj.transform.localScale=new Vector3(layout.widthMm/1000f/image.bounds.size.x,layout.heightMm/1000f/image.bounds.size.y,1);
        if (string.IsNullOrEmpty(layout.background.video)) return;
        string videoPath=ProjectPath(SafeFile(folder,layout.background.video));AssetDatabase.ImportAsset(videoPath);
        VideoClip clip=AssetDatabase.LoadAssetAtPath<VideoClip>(videoPath);
        if (!clip) { Debug.LogWarning("MP4 could not be imported; keeping background PNG."); return; }
        Shader shader=Shader.Find("Unlit/Texture") ?? Shader.Find("Universal Render Pipeline/Unlit");
        if (!shader) { Debug.LogWarning("Unlit shader unavailable; keeping background PNG."); return; }
        var texture=new RenderTexture(Math.Max(16,layout.background.widthPixels),Math.Max(16,layout.background.heightPixels),0);
        texture.name="Jeju Background Video";AssetDatabase.CreateAsset(texture,output+"/Background.renderTexture");
        var material=new Material(shader);material.mainTexture=texture;material.SetTexture("_BaseMap",texture);
        AssetDatabase.CreateAsset(material,output+"/Background.mat");
        var quad=GameObject.CreatePrimitive(PrimitiveType.Quad);quad.name="Background Loop";quad.transform.SetParent(parent,false);
        var collider=quad.GetComponent<Collider>();if(collider)UnityEngine.Object.DestroyImmediate(collider);
        quad.transform.localPosition=new Vector3(0,0,1.01f);
        // Source video uses cover, matching the editor wall crop. UV correction handles any source ratio.
        float wallRatio=layout.widthMm/layout.heightMm,videoRatio=(float)clip.width/clip.height;
        Vector2 uv=videoRatio>wallRatio?new Vector2(wallRatio/videoRatio,1):new Vector2(1,videoRatio/wallRatio);
        material.mainTextureScale=uv;material.mainTextureOffset=(Vector2.one-uv)/2f;
        material.SetTextureScale("_BaseMap",uv);material.SetTextureOffset("_BaseMap",(Vector2.one-uv)/2f);
        quad.transform.localScale=new Vector3(layout.widthMm/1000f,layout.heightMm/1000f,1);
        quad.GetComponent<MeshRenderer>().sharedMaterial=material;
        var player=quad.AddComponent<VideoPlayer>();player.clip=clip;player.isLooping=true;player.playOnAwake=true;
        player.audioOutputMode=VideoAudioOutputMode.None;player.renderMode=VideoRenderMode.RenderTexture;player.targetTexture=texture;
        // Hide still after first video frame; keep it visible until decoding begins.
        quad.AddComponent<JejuBackgroundVideo>().fallback=renderer;
    }
    private static Sprite LoadSprite(string path)
    {
        string assetPath=ProjectPath(path);AssetDatabase.ImportAsset(assetPath);
        var importer=AssetImporter.GetAtPath(assetPath) as TextureImporter;
        if (!importer) throw new InvalidDataException("Not an image: "+assetPath);
        importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;
        importer.alphaIsTransparency=true;importer.spritePixelsPerUnit=100;importer.mipmapEnabled=false;
        importer.maxTextureSize=8192;importer.textureCompression=TextureImporterCompression.Uncompressed;
        importer.spriteAlignment=(int)SpriteAlignment.Center;importer.spritePivot=new Vector2(.5f,.5f);
        importer.SaveAndReimport();Sprite sprite=AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
        if (!sprite) throw new InvalidDataException("Sprite import failed: "+assetPath);return sprite;
    }
    private static bool Finite(float value) { return !float.IsNaN(value) && !float.IsInfinity(value); }
    private static string SafeFile(string folder,string relative)
    {
        if (string.IsNullOrEmpty(relative) || Path.IsPathRooted(relative)) throw new InvalidDataException("Expected relative media path.");
        string root=Path.GetFullPath(folder)+Path.DirectorySeparatorChar;
        string path=Path.GetFullPath(Path.Combine(folder,relative.Replace('/',Path.DirectorySeparatorChar)));
        if (!path.StartsWith(root,StringComparison.OrdinalIgnoreCase) || !File.Exists(path)) throw new InvalidDataException("Missing/outside package media: "+relative);
        return path;
    }
    private static string ProjectPath(string path)
    {
        string root=Path.GetFullPath(Application.dataPath),full=Path.GetFullPath(path);
        if (full.Equals(root,StringComparison.OrdinalIgnoreCase)) return "Assets";
        if (!full.StartsWith(root+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Extract ZIP inside this Unity project's Assets folder first.");
        return "Assets/"+full.Substring(root.Length+1).Replace('\\','/');
    }
    private static string SafeName(string value)
    {
        foreach (char c in Path.GetInvalidFileNameChars()) value=value.Replace(c,'_');
        value=value.Replace('/','_').Replace('\\','_').Trim();return string.IsNullOrEmpty(value)?"Group":value;
    }
}
