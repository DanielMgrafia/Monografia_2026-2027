using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCareerCatalogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Carreras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FacultadId = table.Column<int>(type: "int", nullable: false),
                    AreaConocimientoId = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carreras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Carreras_AreasConocimiento_AreaConocimientoId",
                        column: x => x.AreaConocimientoId,
                        principalTable: "AreasConocimiento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Carreras_Facultades_FacultadId",
                        column: x => x.FacultadId,
                        principalTable: "Facultades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CarreraLineasInvestigacion",
                columns: table => new
                {
                    CarreraId = table.Column<int>(type: "int", nullable: false),
                    LineaInvestigacionId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaAsignacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarreraLineasInvestigacion", x => new { x.CarreraId, x.LineaInvestigacionId });
                    table.ForeignKey(
                        name: "FK_CarreraLineasInvestigacion_Carreras_CarreraId",
                        column: x => x.CarreraId,
                        principalTable: "Carreras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CarreraLineasInvestigacion_LineasInvestigacion_LineaInvestigacionId",
                        column: x => x.LineaInvestigacionId,
                        principalTable: "LineasInvestigacion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarreraLineasInvestigacion_LineaInvestigacionId",
                table: "CarreraLineasInvestigacion",
                column: "LineaInvestigacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Carreras_AreaConocimientoId",
                table: "Carreras",
                column: "AreaConocimientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Carreras_FacultadId",
                table: "Carreras",
                column: "FacultadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarreraLineasInvestigacion");

            migrationBuilder.DropTable(
                name: "Carreras");
        }
    }
}
