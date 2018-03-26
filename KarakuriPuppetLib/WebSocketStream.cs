using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KarakuriPuppetLib
{
    public class WebSocketStream : Stream
    {
        private readonly PuppetString _webSocketBehavior;

        public WebSocketStream(PuppetString webSocketBehavior)
        {
            _webSocketBehavior = webSocketBehavior;
        }

        public override void Flush()
        {
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            // hack
            return 0;
        }

        public override void SetLength(long value)
        {
            throw new NotSupportedException();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            throw new NotSupportedException();
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            if (offset != 0 && count != buffer.Length)
            {
                throw new NotSupportedException();
            }

            try
            {
                _webSocketBehavior.Send(buffer);
            }
            catch
            {
                _webSocketBehavior.CancelAudio();
            }
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => true;
        //hack
        public override long Length => 0;

        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }
    }
}
