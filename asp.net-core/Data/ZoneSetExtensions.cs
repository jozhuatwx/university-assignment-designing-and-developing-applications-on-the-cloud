using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public static class ZoneSetExtensions
    {
        public static async Task<Zone?> GetAsync(this DbSet<Zone> set, string name)
        {
            // Get data from database using name
            return await set
                .FirstOrDefaultAsync(zone => zone.Name == name && !zone.Deleted.HasValue);
        }
    }
}
