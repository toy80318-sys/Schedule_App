using UnityEngine;
using UnityEngine.Video;
namespace JejuWall
{
    [RequireComponent(typeof(VideoPlayer))]
    public sealed class JejuBackgroundVideo : MonoBehaviour
    {
        public SpriteRenderer fallback;
        private VideoPlayer player;
        private void OnEnable()
        {
            player=GetComponent<VideoPlayer>();if(fallback)fallback.enabled=true;
            player.sendFrameReadyEvents=true;player.frameReady+=OnFrame;player.errorReceived+=OnError;
        }
        private void OnDisable()
        {
            if(!player)return;player.frameReady-=OnFrame;player.errorReceived-=OnError;
        }
        private void OnFrame(VideoPlayer source,long frame)
        { if(fallback)fallback.enabled=false;source.sendFrameReadyEvents=false; }
        private void OnError(VideoPlayer source,string message)
        { if(fallback)fallback.enabled=true;Debug.LogWarning("Jeju background video: "+message); }
    }
}
