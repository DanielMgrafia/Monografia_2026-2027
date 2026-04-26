using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentDownloadPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SePuedeDescargar",
                table: "Documentos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.InsertData(
                table: "Permisos",
                columns: new[] { "Id", "Codigo", "Descripcion", "Estado" },
                values: new object[] { 8, "DOCUMENTO.DESCARGAR", "Descargar documentos autorizados", "Activo" });

            migrationBuilder.InsertData(
                table: "RolPermisos",
                columns: new[] { "PermisoId", "RolId", "Estado", "FechaAsignacion" },
                values: new object[,]
                {
                    { 8, 1, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 8, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 8, 3, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RolPermisos",
                keyColumns: new[] { "PermisoId", "RolId" },
                keyValues: new object[] { 8, 1 });

            migrationBuilder.DeleteData(
                table: "RolPermisos",
                keyColumns: new[] { "PermisoId", "RolId" },
                keyValues: new object[] { 8, 2 });

            migrationBuilder.DeleteData(
                table: "RolPermisos",
                keyColumns: new[] { "PermisoId", "RolId" },
                keyValues: new object[] { 8, 3 });

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DropColumn(
                name: "SePuedeDescargar",
                table: "Documentos");
        }
    }
}
