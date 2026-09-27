using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDemoSeedLogins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UsuarioRoles",
                keyColumns: new[] { "RolId", "UsuarioId" },
                keyValues: new object[] { 2, 2 });

            migrationBuilder.DeleteData(
                table: "UsuarioRoles",
                keyColumns: new[] { "RolId", "UsuarioId" },
                keyValues: new object[] { 3, 3 });

            migrationBuilder.DeleteData(
                table: "UsuarioRoles",
                keyColumns: new[] { "RolId", "UsuarioId" },
                keyValues: new object[] { 4, 4 });

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "100000.gGq3KckqT8hrhal5RTb/Zw==.mxgLFbJBzqIMxzFneDGS/QvFzB0PIhKHunf+6rnQ4dU=");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=");

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Apellidos", "Carnet", "Correo", "Estado", "FechaCreacion", "Nombres", "PasswordHash" },
                values: new object[,]
                {
                    { 2, "Docente", "PROF-001", "profesor@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Paula", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" },
                    { 3, "Estudiante", "EST-001", "estudiante@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Luis", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" },
                    { 4, "Decano", "DEC-001", "decano@universidad.edu", "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc), "Marta", "100000.pXNersvxrQkQJwCgdjOmBw==.R3lKdXVfKoq45g4VJKg0ZswpiAHqMqrq7VqFvBKyvyA=" }
                });

            migrationBuilder.InsertData(
                table: "UsuarioRoles",
                columns: new[] { "RolId", "UsuarioId", "Estado", "FechaAsignacion" },
                values: new object[,]
                {
                    { 2, 2, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, 3, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) },
                    { 4, 4, "Activo", new DateTime(2026, 4, 25, 4, 30, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
