using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFacultades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carreras_Facultades_FacultadId",
                table: "Carreras");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_Facultades_FacultadId",
                table: "Documentos");

            migrationBuilder.DropTable(
                name: "Facultades");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_FacultadId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Carreras_FacultadId",
                table: "Carreras");

            migrationBuilder.DropColumn(
                name: "FacultadId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "FacultadId",
                table: "Carreras");

            migrationBuilder.UpdateData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: 5,
                column: "Descripcion",
                value: "Gestionar catalogos academicos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FacultadId",
                table: "Documentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FacultadId",
                table: "Carreras",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Facultades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facultades", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: 5,
                column: "Descripcion",
                value: "Gestionar facultades y tipos de documento");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_FacultadId",
                table: "Documentos",
                column: "FacultadId");

            migrationBuilder.CreateIndex(
                name: "IX_Carreras_FacultadId",
                table: "Carreras",
                column: "FacultadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Carreras_Facultades_FacultadId",
                table: "Carreras",
                column: "FacultadId",
                principalTable: "Facultades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_Facultades_FacultadId",
                table: "Documentos",
                column: "FacultadId",
                principalTable: "Facultades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
