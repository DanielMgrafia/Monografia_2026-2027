namespace RepositorioAcademico.Server.Contracts
{
    public class FavoritoDocumentoDto
    {
        public int DocumentoId { get; set; }

        public bool EsFavorito { get; set; }

        public DateTime? FechaMarcado { get; set; }
    }
}
