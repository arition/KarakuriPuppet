using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace KarakuriPuppetModel
{
    public class MouseScroll
    {
        [JsonProperty("Delta")] public double DoubleDelta { get; set; }

        [JsonIgnore] public int Delta => Convert.ToInt32(Math.Floor(DoubleDelta));
    }
}
