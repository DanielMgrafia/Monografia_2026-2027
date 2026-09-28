using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddInstitutionContactFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ConfiguracionesInstitucion",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telefono",
                table: "ConfiguracionesInstitucion",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "ConfiguracionesInstitucion");

            migrationBuilder.DropColumn(
                name: "Telefono",
                table: "ConfiguracionesInstitucion");
        }
    }
}
