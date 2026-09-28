using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddInstitutionSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguracionesInstitucion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreInstitucion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", maxLength: 200000, nullable: true),
                    Mision = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Vision = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionesInstitucion", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Permisos",
                columns: new[] { "Id", "Codigo", "Descripcion", "Estado" },
                values: new object[] { 9, "INSTITUCION.PARAMETRIZAR", "Configurar datos institucionales", "Activo" });

            migrationBuilder.InsertData(
                table: "RolPermisos",
                columns: new[] { "PermisoId", "RolId", "Estado", "FechaAsignacion" },
                values: new object[] { 9, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracionesInstitucion");

            migrationBuilder.DeleteData(
                table: "RolPermisos",
                keyColumns: new[] { "PermisoId", "RolId" },
                keyValues: new object[] { 9, 1 });

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: 9);
        }
    }
}
