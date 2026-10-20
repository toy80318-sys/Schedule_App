using UnityEngine;

namespace JejuWall
{
    [RequireComponent(typeof(SpriteRenderer))]
    public sealed class JejuPngSequencePlayer : MonoBehaviour
    {
        public Sprite[] frames;
        [Min(0.01f)] public float fps = 30f;
        public bool playing = true;
        private SpriteRenderer target;
        private double elapsed;
        private int lastFrame = -1;
        private void Awake() { target = GetComponent<SpriteRenderer>(); }
        private void OnEnable() { if (!target) target = GetComponent<SpriteRenderer>(); ApplyFrame(); }
        private void Update() { if (playing) { elapsed += Time.deltaTime; ApplyFrame(); } }
        public void Restart() { elapsed = 0; lastFrame = -1; ApplyFrame(); }
        private void ApplyFrame()
        {
            if (frames == null || frames.Length == 0 || !target) return;
            int frame = (int)(System.Math.Floor(elapsed * System.Math.Max(0.01, fps)) % frames.Length);
            if (frame == lastFrame) return;
            target.sprite = frames[frame]; lastFrame = frame;
        }
    }
}
