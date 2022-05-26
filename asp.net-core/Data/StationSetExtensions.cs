using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public static class StationSetExtensions
    {
        public static async Task<Station?> GetAsync(this DbSet<Station> set, string name)
        {
            // Get data from database using name
            return await set
                .FirstOrDefaultAsync(station => station.Name == name && !station.Deleted.HasValue);
        }
    }
}
