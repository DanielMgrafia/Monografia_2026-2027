using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsAdministrador",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EsCargoAcademico",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EsDocente",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EsEstudiante",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EsAdministrador", "EsCargoAcademico", "EsDocente", "EsEstudiante" },
                values: new object[] { true, false, false, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EsAdministrador", "EsCargoAcademico", "EsDocente", "EsEstudiante" },
                values: new object[] { false, false, true, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EsAdministrador", "EsCargoAcademico", "EsDocente", "EsEstudiante" },
                values: new object[] { false, false, false, true });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "EsAdministrador", "EsCargoAcademico", "EsDocente", "EsEstudiante" },
                values: new object[] { false, true, false, false });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "EsAdministrador", "EsCargoAcademico", "EsDocente", "EsEstudiante" },
                values: new object[] { false, true, false, false });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsAdministrador",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "EsCargoAcademico",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "EsDocente",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "EsEstudiante",
                table: "Roles");
        }
    }
}
