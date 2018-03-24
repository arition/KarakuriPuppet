using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using KarakuriPuppetLib;

namespace KarakuriPuppet
{
    class Program
    {
        static void Main(string[] args)
        {
            var puppet = new Puppet();
            puppet.Start("0.0.0.0", 8888, "1212");
            Console.ReadKey();
            puppet.Stop();
        }
    }
}
