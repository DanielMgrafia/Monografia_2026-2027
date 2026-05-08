namespace RepositorioAcademico.Server.Contracts
{
    public class HistorialBibliotecaDto
    {
        public IReadOnlyList<DocumentoActividadDto> Descargas { get; set; } = [];

        public IReadOnlyList<DocumentoActividadDto> Vistos { get; set; } = [];

        public IReadOnlyList<DocumentoActividadDto> Favoritos { get; set; } = [];
    }
}
