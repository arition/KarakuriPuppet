using CSCore.MediaFoundation;
using CSCore.SoundIn;
using KarakuriPuppetModel;
using Newtonsoft.Json;
using System;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;
using WindowsInput;
using ErrorEventArgs = WebSocketSharp.ErrorEventArgs;

namespace KarakuriPuppetLib
{
    public class PuppetString : WebSocketBehavior
    {
        private readonly InputSimulator _inputSimulator = new InputSimulator();
        private readonly string _token;
        private bool _validated;

        public PuppetString(string token)
        {
            _token = token;
        }

        protected override void OnOpen()
        {
            _validated = Context.QueryString["token"] == _token;
            var capture = new WasapiLoopbackCapture();
            capture.Initialize();
            capture.Start();
            var wsStream = new WebSocketStream(this);
            var encoder = MediaFoundationEncoder.CreateMP3Encoder(capture.WaveFormat, wsStream);
            capture.DataAvailable += (sender, e) => encoder.Write(e.Data, e.Offset, e.ByteCount);
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            try
            {
                if (!_validated) return;
                var jsonData = e.Data.Substring(1);
                switch (e.Data[0])
                {
                    case '0':
                        var keyboardData = JsonConvert.DeserializeObject<Keyboard>(jsonData);
                        _inputSimulator.Keyboard.TextEntry(keyboardData.Content);
                        Console.WriteLine($"I Receive: {keyboardData.Content}");
                        break;
                    case '1':
                        var mouseMovedata = JsonConvert.DeserializeObject<MouseMove>(jsonData);
                        _inputSimulator.Mouse.MoveMouseBy(mouseMovedata.DeltaX, mouseMovedata.DeltaY);
                        Console.WriteLine(
                            $"I Receive: MouseX: {mouseMovedata.DeltaX}, MouseY: {mouseMovedata.DeltaY}");
                        break;
                    case '2':
                        _inputSimulator.Mouse.LeftButtonClick();
                        break;
                    case '3':
                        _inputSimulator.Mouse.LeftButtonDown();
                        break;
                    case '4':
                        _inputSimulator.Mouse.LeftButtonUp();
                        break;
                    case '5':
                        _inputSimulator.Mouse.RightButtonClick();
                        break;
                    case '6':
                        _inputSimulator.Mouse.RightButtonDown();
                        break;
                    case '7':
                        _inputSimulator.Mouse.RightButtonUp();
                        break;
                    case '8':
                        var mouseVerticalScrolldata = JsonConvert.DeserializeObject<MouseScroll>(jsonData);
                        _inputSimulator.Mouse.VerticalScroll(mouseVerticalScrolldata.Delta);
                        break;
                    case '9':
                        var mouseHorizontalScrolldata = JsonConvert.DeserializeObject<MouseScroll>(jsonData);
                        _inputSimulator.Mouse.HorizontalScroll(mouseHorizontalScrolldata.Delta);
                        break;
                    default:
                        throw new NotSupportedException();
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
            }
        }
        
        public new void Send(byte[] data)
        {
            base.Send(data);
        }
    }
}
