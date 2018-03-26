using KarakuriPuppetModel;
using Newtonsoft.Json;
using System;
using System.Threading;
using System.Threading.Tasks;
using WebSocketSharp;
using WindowsInput;
using CSCore.MediaFoundation;
using CSCore.SoundIn;
using CSCore.Streams;
using WebSocketSharp.Server;

namespace KarakuriPuppetLib
{
    public class PuppetString : WebSocketBehavior
    {
        private readonly InputSimulator _inputSimulator = new InputSimulator();
        private readonly string _token;
        private bool _validated;
        private readonly CancellationTokenSource _cancellationToken = new CancellationTokenSource();

        public PuppetString(string token)
        {
            _token = token;
        }

        protected override async void OnOpen()
        {
            _validated = Context.QueryString["token"] == _token;
            try
            {
                await Task.Run(() =>
                {
                    using (var capture = new WasapiLoopbackCapture())
                    {
                        capture.Initialize();
                        capture.Start();
                        using (var audioStream = new SoundInSource(capture) {FillWithZeros = false})
                        {
                            using (var wsStream = new WebSocketStream(this))
                            {
                                using (var encoder =
                                    MediaFoundationEncoder.CreateMP3Encoder(audioStream.WaveFormat, wsStream))
                                {
                                    var buffer = new byte[audioStream.WaveFormat.BytesPerSecond / 10];
                                    while (true)
                                    {
                                        var read = audioStream.Read(buffer, 0, buffer.Length);
                                        encoder.Write(buffer, 0, read);
                                        if (_cancellationToken.IsCancellationRequested) break;
                                    }
                                }
                            }
                        }
                    }
                }, _cancellationToken.Token);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
            }
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

        protected override void OnClose(CloseEventArgs e)
        {
            _cancellationToken.Cancel();
            base.OnClose(e);
        }

        protected override void OnError(ErrorEventArgs e)
        {
            _cancellationToken.Cancel();
            base.OnError(e);
        }

        public void CancelAudio()
        {
            _cancellationToken.Cancel();
        }
        
        public new void Send(byte[] data)
        {
            base.Send(data);
        }
    }
}
