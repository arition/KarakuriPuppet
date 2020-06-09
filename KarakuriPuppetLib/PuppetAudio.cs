using System;
using CSCore;
using CSCore.Codecs.AAC;
using CSCore.MediaFoundation;
using CSCore.SoundIn;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace KarakuriPuppetLib
{
    public class PuppetAudio : WebSocketBehavior
    {
        private readonly AudioFormat _format;
        private readonly string _token;
        private bool _validated;

        public PuppetAudio(string token, AudioFormat format)
        {
            _format = format;
            _token = token;
        }

        protected override void OnOpen()
        {
            _validated = Context.QueryString["token"] == _token;
            if (!_validated) Context.WebSocket.Close(4000);
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            try
            {
                if (!_validated) return;
                switch (e.Data[0])
                {
                    case '0':
                        Send(Enum.GetName(typeof(AudioFormat), _format));
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
            }
        }
    }

    public class PuppetAudioStream : WebSocketBehavior, IPuppetWebSocketStream
    {
        private readonly AudioFormat _format;
        private readonly string _token;
        private bool _validated;

        public PuppetAudioStream(string token, AudioFormat format)
        {
            _format = format;
            _token = token;
        }

        public new void Send(byte[] data)
        {
            base.Send(data);
        }

        protected override void OnOpen()
        {
            _validated = Context.QueryString["token"] == _token;
            if (!_validated) Context.WebSocket.Close(4000);
            var capture = new WasapiLoopbackCapture(0, new WaveFormat());
            capture.Initialize();
            capture.Start();
            var wsStream = new WebSocketStream(this);
            Console.WriteLine($"Captured audio format: {capture.WaveFormat}");
            IWriteable encoder = null;
            switch (_format)
            {
                case AudioFormat.AAC:
                    encoder = new AacEncoder(capture.WaveFormat, wsStream, 192000,
                        TranscodeContainerTypes.MFTranscodeContainerType_ADTS);
                    break;
                case AudioFormat.MP3:
                    encoder = MediaFoundationEncoder.CreateMP3Encoder(capture.WaveFormat, wsStream);
                    break;
            }

            capture.DataAvailable += (sender, e) => { encoder?.Write(e.Data, e.Offset, e.ByteCount); };
        }
    }
}