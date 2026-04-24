using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Domain;

namespace RepositorioAcademico.Server.Infrastructure.Data
{
    public class RepositorioDbContext : DbContext
    {
        public RepositorioDbContext(DbContextOptions<RepositorioDbContext> options)
            : base(options)
        {
        }

        public DbSet<Documento> Documentos { get; set; }

        public DbSet<TipoDocumento> TiposDocumento { get; set; }

        public DbSet<Facultad> Facultades { get; set; }
    }
}