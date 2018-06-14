using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommandLine;

namespace KarakuriPuppet
{
    class Option
    {
        [Option('p', "port", Default = 8888, HelpText = "The port of the server.")]
        public int Port { get; set; }

        [Option('t', "token", Required = true, HelpText = "The token of the server.")]
        public string Token { get; set; }
    }
}
