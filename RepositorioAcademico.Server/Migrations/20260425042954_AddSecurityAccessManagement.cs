using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityAccessManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permisos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permisos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombres = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Correo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Carnet = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolPermisos",
                columns: table => new
                {
                    RolId = table.Column<int>(type: "int", nullable: false),
                    PermisoId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolPermisos", x => new { x.RolId, x.PermisoId });
                    table.ForeignKey(
                        name: "FK_RolPermisos_Permisos_PermisoId",
                        column: x => x.PermisoId,
                        principalTable: "Permisos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RolPermisos_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioRoles",
                columns: table => new
                {
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    RolId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioRoles", x => new { x.UsuarioId, x.RolId });
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UsuarioRoles_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Permisos",
                columns: new[] { "Id", "Codigo", "Descripcion", "Estado" },
                values: new object[,]
                {
                    { 1, "DASHBOARD.VER", "Visualizar panel principal", "Activo" },
                    { 2, "REPOSITORIO.VER", "Visualizar el repositorio academico", "Activo" },
                    { 3, "DOCUMENTO.SUBIR", "Subir nuevos documentos", "Activo" },
                    { 4, "DOCUMENTO.PUBLICAR", "Publicar o revisar documentos pendientes", "Activo" },
                    { 5, "CATALOGO.GESTIONAR", "Gestionar facultades y tipos de documento", "Activo" },
                    { 6, "USUARIO.GESTIONAR", "Crear y administrar usuarios", "Activo" },
                    { 7, "ROL.GESTIONAR", "Crear y administrar roles", "Activo" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Descripcion", "Estado", "Nombre" },
                values: new object[,]
                {
                    { 1, "Acceso total al sistema", "Activo", "Administrador" },
                    { 2, "Puede ver repositorio y subir documentos", "Activo", "Profesor" },
                    { 3, "Solo consulta el repositorio", "Activo", "Estudiante" },
                    { 4, "Puede revisar y publicar documentos", "Activo", "Decano" },
                    { 5, "Puede revisar y publicar documentos", "Activo", "Director" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Apellidos", "Carnet", "Correo", "Estado", "FechaCreacion", "Nombres", "PasswordHash" },
                values: new object[,]
                {
                    { 1, "Sistema", "ADMIN-001", "admin@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Admin", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" },
                    { 2, "Docente", "PROF-001", "profesor@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Paula", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" },
                    { 3, "Estudiante", "EST-001", "estudiante@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Luis", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" },
                    { 4, "Decano", "DEC-001", "decano@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Marta", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" }
                });

            migrationBuilder.InsertData(
                table: "RolPermisos",
                columns: new[] { "PermisoId", "RolId", "Estado", "FechaAsignacion" },
                values: new object[,]
                {
                    { 1, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 4, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 5, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 6, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 7, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 1, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 1, 3, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 3, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 1, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 4, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 1, 5, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 5, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 5, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 4, 5, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "UsuarioRoles",
                columns: new[] { "RolId", "UsuarioId", "Estado", "FechaAsignacion" },
                values: new object[,]
                {
                    { 1, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 2, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 3, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 4, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Permisos_Codigo",
                table: "Permisos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolPermisos_PermisoId",
                table: "RolPermisos",
                column: "PermisoId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioRoles_RolId",
                table: "UsuarioRoles",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Carnet",
                table: "Usuarios",
                column: "Carnet",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Correo",
                table: "Usuarios",
                column: "Correo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RolPermisos");

            migrationBuilder.DropTable(
                name: "UsuarioRoles");

            migrationBuilder.DropTable(
                name: "Permisos");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
