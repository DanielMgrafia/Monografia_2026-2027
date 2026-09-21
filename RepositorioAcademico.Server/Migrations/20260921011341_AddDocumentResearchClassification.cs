using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentResearchClassification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CarreraId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LineaInvestigacionId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SublineaInvestigacionId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_CarreraId",
                table: "Documentos",
                column: "CarreraId");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_LineaInvestigacionId",
                table: "Documentos",
                column: "LineaInvestigacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_SublineaInvestigacionId",
                table: "Documentos",
                column: "SublineaInvestigacionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_Carreras_CarreraId",
                table: "Documentos",
                column: "CarreraId",
                principalTable: "Carreras",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_LineasInvestigacion_LineaInvestigacionId",
                table: "Documentos",
                column: "LineaInvestigacionId",
                principalTable: "LineasInvestigacion",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_SublineasInvestigacion_SublineaInvestigacionId",
                table: "Documentos",
                column: "SublineaInvestigacionId",
                principalTable: "SublineasInvestigacion",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_Carreras_CarreraId",
                table: "Documentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_LineasInvestigacion_LineaInvestigacionId",
                table: "Documentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_SublineasInvestigacion_SublineaInvestigacionId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_CarreraId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_LineaInvestigacionId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_SublineaInvestigacionId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "CarreraId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "LineaInvestigacionId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "SublineaInvestigacionId",
                table: "Documentos");
        }
    }
}
