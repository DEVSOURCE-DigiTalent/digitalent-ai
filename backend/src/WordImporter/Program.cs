using System;
using System.Linq;
using Npgsql;
using Dapper;

namespace WordImporter
{
    class Program
    {
        static void Main(string[] args)
        {
            var connStr = "Host=localhost;Port=5433;Database=digitalent;Username=digitalent_app;Password=NCPQzP7sahjuc13LR4gT7fjE";
            using var conn = new NpgsqlConnection(connStr);
            conn.Open();

            var tables = conn.Query<string>("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").ToList();
            Console.WriteLine("Tables: " + string.Join(", ", tables));

            var sql = System.IO.File.ReadAllText(@"d:\project\digitalent-ai\backend\migration.sql");
            conn.Execute(sql);
            Console.WriteLine("Successfully created course_modules and lessons tables!");
        }
    }
}
