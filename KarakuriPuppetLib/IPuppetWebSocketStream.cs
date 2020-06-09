using WebSocketSharp;

namespace KarakuriPuppetLib
{
    public interface IPuppetWebSocketStream
    {
        void Send(byte[] data);

        WebSocketState State { get; }
    }
}