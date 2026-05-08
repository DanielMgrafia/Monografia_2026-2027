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

        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Rol> Roles { get; set; }

        public DbSet<Permiso> Permisos { get; set; }

        public DbSet<UsuarioRol> UsuarioRoles { get; set; }

        public DbSet<RolPermiso> RolPermisos { get; set; }

        public DbSet<DocumentoVista> DocumentoVistas { get; set; }

        public DbSet<DocumentoDescarga> DocumentoDescargas { get; set; }

        public DbSet<DocumentoFavorito> DocumentoFavoritos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var fechaSemilla = new DateTime(2026, 4, 25, 4, 30, 0, DateTimeKind.Utc);
            const string passwordHashSemilla = "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=";

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

                entity.Property(item => item.Tutor)
                    .HasMaxLength(200);

                entity.Property(item => item.Descripcion)
                    .HasMaxLength(1500);

                entity.Property(item => item.PalabrasClave)
                    .HasMaxLength(500);

                entity.Property(item => item.Estado)
                    .HasMaxLength(50);

                entity.Property(item => item.SePuedeDescargar)
                    .HasDefaultValue(true);

                entity.HasOne(item => item.TipoDocumento)
                    .WithMany(item => item.Documentos)
                    .HasForeignKey(item => item.TipoDocumentoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(item => item.Facultad)
                    .WithMany(item => item.Documentos)
                    .HasForeignKey(item => item.FacultadId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(item => item.Usuario)
                    .WithMany(item => item.Documentos)
                    .HasForeignKey(item => item.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DocumentoVista>(entity =>
            {
                entity.Property(item => item.FechaVista)
                    .IsRequired();

                entity.HasOne(item => item.Documento)
                    .WithMany(item => item.Vistas)
                    .HasForeignKey(item => item.DocumentoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(item => item.Usuario)
                    .WithMany(item => item.DocumentosVistos)
                    .HasForeignKey(item => item.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DocumentoDescarga>(entity =>
            {
                entity.Property(item => item.FechaDescarga)
                    .IsRequired();

                entity.HasOne(item => item.Documento)
                    .WithMany(item => item.Descargas)
                    .HasForeignKey(item => item.DocumentoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(item => item.Usuario)
                    .WithMany(item => item.DocumentosDescargados)
                    .HasForeignKey(item => item.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DocumentoFavorito>(entity =>
            {
                entity.Property(item => item.FechaMarcado)
                    .IsRequired();

                entity.HasIndex(item => new { item.UsuarioId, item.DocumentoId })
                    .IsUnique();

                entity.HasOne(item => item.Documento)
                    .WithMany(item => item.Favoritos)
                    .HasForeignKey(item => item.DocumentoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(item => item.Usuario)
                    .WithMany(item => item.DocumentosFavoritos)
                    .HasForeignKey(item => item.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.Property(item => item.Nombres)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Apellidos)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Correo)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Carnet)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(item => item.PasswordHash)
                    .HasMaxLength(500)
                    .IsRequired();

                entity.Property(item => item.Estado)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(item => item.Correo)
                    .IsUnique();

                entity.HasIndex(item => item.Carnet)
                    .IsUnique();
            });

            modelBuilder.Entity<Rol>(entity =>
            {
                entity.Property(item => item.Nombre)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(item => item.Descripcion)
                    .HasMaxLength(200);

                entity.Property(item => item.Estado)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(item => item.Nombre)
                    .IsUnique();
            });

            modelBuilder.Entity<Permiso>(entity =>
            {
                entity.Property(item => item.Codigo)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(item => item.Descripcion)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(item => item.Estado)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(item => item.Codigo)
                    .IsUnique();
            });

            modelBuilder.Entity<UsuarioRol>(entity =>
            {
                entity.HasKey(item => new { item.UsuarioId, item.RolId });

                entity.Property(item => item.Estado)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasOne(item => item.Usuario)
                    .WithMany(item => item.UsuarioRoles)
                    .HasForeignKey(item => item.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(item => item.Rol)
                    .WithMany(item => item.UsuarioRoles)
                    .HasForeignKey(item => item.RolId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<RolPermiso>(entity =>
            {
                entity.HasKey(item => new { item.RolId, item.PermisoId });

                entity.Property(item => item.Estado)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasOne(item => item.Rol)
                    .WithMany(item => item.RolPermisos)
                    .HasForeignKey(item => item.RolId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(item => item.Permiso)
                    .WithMany(item => item.RolPermisos)
                    .HasForeignKey(item => item.PermisoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Permiso>().HasData(
                new Permiso { Id = 1, Codigo = "DASHBOARD.VER", Descripcion = "Visualizar panel principal", Estado = "Activo" },
                new Permiso { Id = 2, Codigo = "REPOSITORIO.VER", Descripcion = "Visualizar el repositorio academico", Estado = "Activo" },
                new Permiso { Id = 3, Codigo = "DOCUMENTO.SUBIR", Descripcion = "Subir nuevos documentos", Estado = "Activo" },
                new Permiso { Id = 4, Codigo = "DOCUMENTO.PUBLICAR", Descripcion = "Publicar o revisar documentos pendientes", Estado = "Activo" },
                new Permiso { Id = 5, Codigo = "CATALOGO.GESTIONAR", Descripcion = "Gestionar facultades y tipos de documento", Estado = "Activo" },
                new Permiso { Id = 6, Codigo = "USUARIO.GESTIONAR", Descripcion = "Crear y administrar usuarios", Estado = "Activo" },
                new Permiso { Id = 7, Codigo = "ROL.GESTIONAR", Descripcion = "Crear y administrar roles", Estado = "Activo" },
                new Permiso { Id = 8, Codigo = "DOCUMENTO.DESCARGAR", Descripcion = "Descargar documentos autorizados", Estado = "Activo" }
            );

            modelBuilder.Entity<Rol>().HasData(
                new Rol { Id = 1, Nombre = "Administrador", Descripcion = "Acceso total al sistema", Estado = "Activo" },
                new Rol { Id = 2, Nombre = "Profesor", Descripcion = "Puede ver repositorio y subir documentos", Estado = "Activo" },
                new Rol { Id = 3, Nombre = "Estudiante", Descripcion = "Solo consulta el repositorio", Estado = "Activo" },
                new Rol { Id = 4, Nombre = "Decano", Descripcion = "Puede revisar y publicar documentos", Estado = "Activo" },
                new Rol { Id = 5, Nombre = "Director", Descripcion = "Puede revisar y publicar documentos", Estado = "Activo" }
            );


            modelBuilder.Entity<RolPermiso>().HasData(
                new RolPermiso { RolId = 1, PermisoId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 3, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 4, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 5, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 6, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 7, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 1, PermisoId = 8, Estado = "Activo", FechaAsignacion = fechaSemilla },

                new RolPermiso { RolId = 2, PermisoId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 2, PermisoId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 2, PermisoId = 3, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 2, PermisoId = 8, Estado = "Activo", FechaAsignacion = fechaSemilla },

                new RolPermiso { RolId = 3, PermisoId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 3, PermisoId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 3, PermisoId = 8, Estado = "Activo", FechaAsignacion = fechaSemilla },

                new RolPermiso { RolId = 4, PermisoId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 4, PermisoId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 4, PermisoId = 3, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 4, PermisoId = 4, Estado = "Activo", FechaAsignacion = fechaSemilla },

                new RolPermiso { RolId = 5, PermisoId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 5, PermisoId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 5, PermisoId = 3, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new RolPermiso { RolId = 5, PermisoId = 4, Estado = "Activo", FechaAsignacion = fechaSemilla }
            );

            modelBuilder.Entity<Usuario>().HasData(
                new Usuario
                {
                    Id = 1,
                    Nombres = "Admin",
                    Apellidos = "Sistema",
                    Correo = "admin@universidad.edu",
                    Carnet = "ADMIN-001",
                    PasswordHash = passwordHashSemilla,
                    Estado = "Activo",
                    FechaCreacion = fechaSemilla
                },
                new Usuario
                {
                    Id = 2,
                    Nombres = "Paula",
                    Apellidos = "Docente",
                    Correo = "profesor@universidad.edu",
                    Carnet = "PROF-001",
                    PasswordHash = passwordHashSemilla,
                    Estado = "Activo",
                    FechaCreacion = fechaSemilla
                },
                new Usuario
                {
                    Id = 3,
                    Nombres = "Luis",
                    Apellidos = "Estudiante",
                    Correo = "estudiante@universidad.edu",
                    Carnet = "EST-001",
                    PasswordHash = passwordHashSemilla,
                    Estado = "Activo",
                    FechaCreacion = fechaSemilla
                },
                new Usuario
                {
                    Id = 4,
                    Nombres = "Marta",
                    Apellidos = "Decano",
                    Correo = "decano@universidad.edu",
                    Carnet = "DEC-001",
                    PasswordHash = passwordHashSemilla,
                    Estado = "Activo",
                    FechaCreacion = fechaSemilla
                }
            );

            modelBuilder.Entity<UsuarioRol>().HasData(
                new UsuarioRol { UsuarioId = 1, RolId = 1, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new UsuarioRol { UsuarioId = 2, RolId = 2, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new UsuarioRol { UsuarioId = 3, RolId = 3, Estado = "Activo", FechaAsignacion = fechaSemilla },
                new UsuarioRol { UsuarioId = 4, RolId = 4, Estado = "Activo", FechaAsignacion = fechaSemilla }
            );
        }
    }
}
