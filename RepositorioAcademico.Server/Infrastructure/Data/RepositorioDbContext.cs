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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TipoDocumento>(entity =>
            {
                entity.Property(item => item.Descripcion)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Estado)
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<Facultad>(entity =>
            {
                entity.Property(item => item.Descripcion)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Estado)
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<Documento>(entity =>
            {
                entity.Property(item => item.Titulo)
                    .HasMaxLength(250);

                entity.Property(item => item.Autor)
                    .HasMaxLength(200);

                entity.Property(item => item.RutaDocumento)
                    .HasMaxLength(260);

                entity.Property(item => item.Estado)
                    .HasMaxLength(50);

                entity.HasOne(item => item.TipoDocumento)
                    .WithMany(item => item.Documentos)
                    .HasForeignKey(item => item.TipoDocumentoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(item => item.Facultad)
                    .WithMany(item => item.Documentos)
                    .HasForeignKey(item => item.FacultadId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
