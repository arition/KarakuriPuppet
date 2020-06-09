using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp;

namespace KarakuriPuppetLib
{
    public class WebSocketStream : MemoryStream
    {
        private readonly IPuppetWebSocketStream _puppetWebSocketStream;

        public WebSocketStream(IPuppetWebSocketStream puppetWebSocketStream)
        {
            _puppetWebSocketStream = puppetWebSocketStream;
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            if (_puppetWebSocketStream.State == WebSocketState.Open)
            {
                _puppetWebSocketStream.Send(buffer);
            }
        }
    }
}
