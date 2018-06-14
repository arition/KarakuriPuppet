using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CommandLine;
using KarakuriPuppetLib;

namespace KarakuriPuppet
{
    class Program
    {
        static void Main(string[] args)
        {
            Parser.Default.ParseArguments<Option>(args).WithParsed(opt =>
            {
                var puppet = new Puppet();
                puppet.Start("0.0.0.0", opt.Port, opt.Token);
                Console.WriteLine($"Server runs on: 0.0.0.0:{opt.Port}. Press Ctrl+C to stop.");
                while (true)
                {
                    Console.ReadKey(true);
                }
            });
        }
    }
}
