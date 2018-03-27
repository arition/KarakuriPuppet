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
        private readonly PuppetString _puppetString;

        public WebSocketStream(PuppetString puppetString)
        {
            _puppetString = puppetString;
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            if (_puppetString.State == WebSocketState.Open)
            {
                _puppetString.Send(buffer);
            }
        }
    }
}
