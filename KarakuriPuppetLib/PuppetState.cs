using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp;
using WebSocketSharp.Net;
using WebSocketSharp.Server;

namespace KarakuriPuppetLib
{
    public interface IPuppetState
    {
        IPuppetState Start(Puppet puppet);
        IPuppetState Stop(Puppet puppet);
    }

    public partial class Puppet
    {
        public class PuppetStateStarted : IPuppetState
        {
            private static IPuppetState _self;

            private PuppetStateStarted()
            {
            }

            public static IPuppetState GetInstance()
            {
                return _self ?? (_self = new PuppetStateStarted());
            }

            public IPuppetState Start(Puppet puppet)
            {
                throw new NotSupportedException();
            }

            public IPuppetState Stop(Puppet puppet)
            {
                puppet._webSocketServer.Stop(CloseStatusCode.Away, "Sever closed");
                puppet._webSocketServer.RemoveWebSocketService("/string");
                return PuppetStateStoped.GetInstance();
            }
        }

        public class PuppetStateStoped : IPuppetState
        {
            private static IPuppetState _self;

            private PuppetStateStoped()
            {
            }

            public static IPuppetState GetInstance()
            {
                return _self ?? (_self = new PuppetStateStoped());
            }

            public IPuppetState Start(Puppet puppet)
            {
                var webSocketServer = new WebSocketServer($"ws://{puppet._ip}:{puppet._port}")
                {
                    Realm = "KarakuriPuppet"
                };
#pragma warning disable 618
                webSocketServer.AddWebSocketService("/string", () => new PuppetString(puppet._token));
#pragma warning restore 618
                //webSocketServer.AddWebSocketService<PuppetString>("/string");
                webSocketServer.Start();
                puppet._webSocketServer = webSocketServer;
                return PuppetStateStarted.GetInstance();
            }

            public IPuppetState Stop(Puppet puppet)
            {
                throw new NotSupportedException();
            }
        }
    }
}
