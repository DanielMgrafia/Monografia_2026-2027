using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentMetadataAndLibraryHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AnioPublicacion",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Documentos",
                type: "nvarchar(1500)",
                maxLength: 1500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PalabrasClave",
                table: "Documentos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tutor",
                table: "Documentos",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DocumentoDescargas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    FechaDescarga = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoDescargas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentoDescargas_Documentos_DocumentoId",
                        column: x => x.DocumentoId,
                        principalTable: "Documentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentoDescargas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoFavoritos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    FechaMarcado = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoFavoritos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentoFavoritos_Documentos_DocumentoId",
                        column: x => x.DocumentoId,
                        principalTable: "Documentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentoFavoritos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoVistas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    FechaVista = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoVistas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentoVistas_Documentos_DocumentoId",
                        column: x => x.DocumentoId,
                        principalTable: "Documentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentoVistas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoDescargas_DocumentoId",
                table: "DocumentoDescargas",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoDescargas_UsuarioId",
                table: "DocumentoDescargas",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoFavoritos_DocumentoId",
                table: "DocumentoFavoritos",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoFavoritos_UsuarioId_DocumentoId",
                table: "DocumentoFavoritos",
                columns: new[] { "UsuarioId", "DocumentoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoVistas_DocumentoId",
                table: "DocumentoVistas",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoVistas_UsuarioId",
                table: "DocumentoVistas",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentoDescargas");

            migrationBuilder.DropTable(
                name: "DocumentoFavoritos");

            migrationBuilder.DropTable(
                name: "DocumentoVistas");

            migrationBuilder.DropColumn(
                name: "AnioPublicacion",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "PalabrasClave",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "Tutor",
                table: "Documentos");
        }
    }
}
