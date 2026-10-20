using System;
using UnityEngine;

namespace JejuWall
{
    [Serializable] public class Layout
    {
        public string format, name, units;
        public int version;
        public float widthMm, heightMm, defaultFps;
        public Section[] sections;
        public Media[] assets;
        public Item[] objects;
        public Style[] styles;
        public Background background;
    }
    [Serializable] public class Section { public string id; public float startMm, widthMm, heightMm; }
    [Serializable] public class Media
    {
        public string id, name, kind, flowerColor, sourceAssetId, quality;
        public string[] frames;
        public float fps;
        public bool colorBaked, lightingBaked, statePreviewOnly;
        public string budImage, openImage;
        public int widthPixels, heightPixels, sourceFrameCount;
    }
    [Serializable] public class Item
    {
        public string id, name, assetId, groupId, groupName, styleCategoryId, stylePresetId, flowerColor;
        public float editorXmm, editorYmm, xMeters, yMeters, widthMeters, heightMeters, rotationZ, opacity;
        public int sortingOrder;
        public bool flipX;
    }
    [Serializable] public class Style { public string id, name; public Preset[] presets; }
    [Serializable] public class Preset { public string id, name; public float widthMm, heightMm; public Item[] objects; }
    [Serializable] public class Background { public string image, video, fit; public int widthPixels, heightPixels; }

    public sealed class JejuWallInfo : MonoBehaviour
    {
        public float widthMeters = 14.165f, heightMeters = 3.48f;
        public Section[] sections;
        public bool showGrid = true;
        private void OnDrawGizmosSelected()
        {
            float l = -widthMeters / 2f, b = -heightMeters / 2f;
            if (showGrid)
            {
                Gizmos.color = new Color(.6f, .7f, .8f, .25f);
                for (float x = 0; x <= widthMeters; x += .5f) Line(l+x,b,l+x,b+heightMeters);
                for (float y = 0; y <= heightMeters; y += .5f) Line(l,b+y,l+widthMeters,b+y);
            }
            Gizmos.color = new Color(.4f, .9f, .85f);
            Line(l,b,l+widthMeters,b); Line(l,b+heightMeters,l+widthMeters,b+heightMeters);
            Line(l,b,l,b+heightMeters); Line(l+widthMeters,b,l+widthMeters,b+heightMeters);
            if (sections != null) foreach (Section section in sections)
                Line(l+section.startMm/1000f,b,l+section.startMm/1000f,b+heightMeters);
        }
        private void Line(float x1,float y1,float x2,float y2)
        { Gizmos.DrawLine(transform.TransformPoint(new Vector3(x1,y1,0)),transform.TransformPoint(new Vector3(x2,y2,0))); }
    }
}
