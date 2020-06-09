using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommandLine;
using KarakuriPuppetLib;

namespace KarakuriPuppet
{
    class Option
    {

        [Option('p', "port", Default = 8888, HelpText = "The port of the server.")]
        public int Port { get; set; }

        [Option('t', "token", Required = true, HelpText = "The token of the server.")]
        public string Token { get; set; }

        [Option('f', "format", Default = AudioFormat.MP3, HelpText = "Output format of the audio stream.")]
        public AudioFormat Format { get; set; }
    }
}
