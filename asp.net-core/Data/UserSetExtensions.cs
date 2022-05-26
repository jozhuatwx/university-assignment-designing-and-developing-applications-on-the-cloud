using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public static class UserSetExtensions
    {
        public static async Task<User?> GetAsync(this DbSet<User> set, string email)
        {
            // Get data from database using email
            return await set
                .FirstOrDefaultAsync(user => user.Email == email && !user.Deleted.HasValue);
        }
    }
}
