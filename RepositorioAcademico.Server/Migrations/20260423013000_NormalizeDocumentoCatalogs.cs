using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RepositorioAcademico.Server.Migrations
{
    public partial class NormalizeDocumentoCatalogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "TiposDocumento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descripcion = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDocumento", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Facultades",
                columns: ["Id", "Descripcion", "Estado"],
                values: new object[] { 1, "Sin especificar", "Activo" });

            migrationBuilder.InsertData(
                table: "TiposDocumento",
                columns: ["Id", "Descripcion", "Estado"],
                values: new object[,]
                {
                    { 1, "Tesis", "Activo" },
                    { 2, "Ensayo", "Activo" },
                    { 3, "Articulo", "Activo" },
                    { 4, "Revista", "Activo" },
                    { 5, "Investigacion", "Activo" },
                    { 6, "Sin especificar", "Activo" }
                });

            migrationBuilder.AddColumn<int>(
                name: "FacultadId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoDocumentoId",
                table: "Documentos",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                INSERT INTO TiposDocumento (Descripcion, Estado)
                SELECT DISTINCT LTRIM(RTRIM(Tipo)), N'Activo'
                FROM Documentos
                WHERE Tipo IS NOT NULL
                  AND LTRIM(RTRIM(Tipo)) <> N''
                  AND NOT EXISTS (
                    SELECT 1
                    FROM TiposDocumento
                    WHERE Descripcion = LTRIM(RTRIM(Documentos.Tipo))
                  );
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO Facultades (Descripcion, Estado)
                SELECT DISTINCT LTRIM(RTRIM(Categoria)), N'Activo'
                FROM Documentos
                WHERE Categoria IS NOT NULL
                  AND LTRIM(RTRIM(Categoria)) <> N''
                  AND NOT EXISTS (
                    SELECT 1
                    FROM Facultades
                    WHERE Descripcion = LTRIM(RTRIM(Documentos.Categoria))
                  );
                """);

            migrationBuilder.Sql(
                """
                UPDATE d
                SET d.TipoDocumentoId = td.Id
                FROM Documentos d
                INNER JOIN TiposDocumento td
                    ON td.Descripcion = LTRIM(RTRIM(d.Tipo))
                WHERE d.Tipo IS NOT NULL
                  AND LTRIM(RTRIM(d.Tipo)) <> N'';
                """);

            migrationBuilder.Sql(
                """
                UPDATE d
                SET d.FacultadId = f.Id
                FROM Documentos d
                INNER JOIN Facultades f
                    ON f.Descripcion = LTRIM(RTRIM(d.Categoria))
                WHERE d.Categoria IS NOT NULL
                  AND LTRIM(RTRIM(d.Categoria)) <> N'';
                """);

            migrationBuilder.Sql("UPDATE Documentos SET TipoDocumentoId = 6 WHERE TipoDocumentoId IS NULL;");
            migrationBuilder.Sql("UPDATE Documentos SET FacultadId = 1 WHERE FacultadId IS NULL;");

            migrationBuilder.AlterColumn<int>(
                name: "FacultadId",
                table: "Documentos",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TipoDocumentoId",
                table: "Documentos",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_FacultadId",
                table: "Documentos",
                column: "FacultadId");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_TipoDocumentoId",
                table: "Documentos",
                column: "TipoDocumentoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_Facultades_FacultadId",
                table: "Documentos",
                column: "FacultadId",
                principalTable: "Facultades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_TiposDocumento_TipoDocumentoId",
                table: "Documentos",
                column: "TipoDocumentoId",
                principalTable: "TiposDocumento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Documentos");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_Facultades_FacultadId",
                table: "Documentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_TiposDocumento_TipoDocumentoId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_FacultadId",
                table: "Documentos");

            migrationBuilder.DropIndex(
                name: "IX_Documentos_TipoDocumentoId",
                table: "Documentos");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Documentos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Documentos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE d
                SET
                    d.Tipo = td.Descripcion,
                    d.Categoria = f.Descripcion
                FROM Documentos d
                LEFT JOIN TiposDocumento td
                    ON td.Id = d.TipoDocumentoId
                LEFT JOIN Facultades f
                    ON f.Id = d.FacultadId;
                """);

            migrationBuilder.DropColumn(
                name: "FacultadId",
                table: "Documentos");

            migrationBuilder.DropColumn(
                name: "TipoDocumentoId",
                table: "Documentos");

            migrationBuilder.DropTable(
                name: "Facultades");

            migrationBuilder.DropTable(
                name: "TiposDocumento");
        }
    }
}
