using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    public class DataContext : DbContext
    {
        public DbSet<Bus> Bus { get; protected set; }
        public DbSet<Route> Route { get; protected set; }
        public DbSet<Station> Station { get; protected set; }
        public DbSet<RouteStation> RouteStation { get; protected set; }
        public DbSet<User> User { get; protected set; }
        public DbSet<Zone> Zone { get; protected set; }

        public DataContext(DbContextOptions options)
            : base(options)
        {
        }
    }

    public static class DataContextExtensions
    {
        public static bool HasData<T>(this DbSet<T> set) where T : SetEntity
        {
            return set.Any();
        }

        public static async Task<List<T>> GetAllAsync<T>(this DbSet<T> set) where T : SetEntity
        {
            // Get all data from database
            return await set
                .Where(entity => !entity.Deleted.HasValue)
                .ToListAsync();
        }

        public static T? Get<T>(this DbSet<T> set, Guid id) where T : SetEntity
        {
            // Get data from database using id
            return set
                .FirstOrDefault(entity => entity.Id == id && !entity.Deleted.HasValue);
        }

        public static async Task<T?> GetAsync<T>(this DbSet<T> set, Guid id) where T : SetEntity
        {
            // Get data from database using id
            return await set
                .FirstOrDefaultAsync(entity => entity.Id == id && !entity.Deleted.HasValue);
        }

        public static async Task CreateAsync<T>(this DbSet<T> set, DataContext context, T data) where T : SetEntity
        {
            // Add data to database
            await set.AddAsync(data);
            await context.SaveChangesAsync();
        }

        public static async Task UpdateAsync<T>(this DbSet<T> set, DataContext context, T data) where T : SetEntity
        {
            // Update data in database
            set.Update(data);
            await context.SaveChangesAsync();
        }

        public static async Task DeleteAsync<T>(this DbSet<T> set, DataContext context, T data) where T : SetEntity
        {
            // Soft delete data from database
            data.Deleted = true;
            set.Update(data);
            await context.SaveChangesAsync();
        }
    }
}
