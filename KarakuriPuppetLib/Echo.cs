using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace KarakuriPuppetLib
{
    public class Echo : WebSocketBehavior
    {
        private readonly string _token;
        private bool _validated;

        public Echo(string token)
        {
            _token = token;
        }

        protected override void OnOpen()
        {
            _validated = Context.QueryString["token"] == _token;
            if (!_validated) Context.WebSocket.Close(4000);
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            if (_validated) Send(e.Data);
        }
    }
}
