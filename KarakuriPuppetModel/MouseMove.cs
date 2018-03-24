using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace KarakuriPuppetModel
{
    public class MouseMove
    {
        [JsonProperty("DeltaX")] public double DoubleDeltaX { get; set; }
        [JsonProperty("DeltaY")] public double DoubleDeltaY { get; set; }

        [JsonIgnore] public int DeltaX => Convert.ToInt32(Math.Floor(DoubleDeltaX * 2));
        [JsonIgnore] public int DeltaY => Convert.ToInt32(Math.Floor(DoubleDeltaY * 2));
    }
}
