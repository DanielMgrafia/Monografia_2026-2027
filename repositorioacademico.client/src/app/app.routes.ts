import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { permissionGuard } from './guards/permission.guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { CarreraLineasInvestigacionComponent } from './components/carrera-lineas-investigacion/carrera-lineas-investigacion.component';
import { CrearAreaConocimientoComponent } from './components/crear-area-conocimiento/crear-area-conocimiento.component';
import { CrearCarreraComponent } from './components/crear-carrera/crear-carrera.component';
import { CrearLineaInvestigacionComponent } from './components/crear-linea-investigacion/crear-linea-investigacion.component';
import { CrearSublineaInvestigacionComponent } from './components/crear-sublinea-investigacion/crear-sublinea-investigacion.component';
import { CrearTipoDocumentoComponent } from './components/crear-tipo-documento/crear-tipo-documento.component';
import { ListaDocumentosComponent } from './components/lista-documentos/lista-documentos.component';
import { SubirDocumentoComponent } from './components/subir-documento/subir-documento.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { DocumentViewerPageComponent } from './pages/document-viewer-page/document-viewer-page.component';
import { EditDocumentsPageComponent } from './pages/edit-documents-page/edit-documents-page.component';
import { HistoryPageComponent } from './pages/history-page/history-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RoleCatalogPageComponent } from './pages/role-catalog-page/role-catalog-page.component';
import { ReviewDocumentsPageComponent } from './pages/review-documents-page/review-documents-page.component';
import { RolesPageComponent } from './pages/roles-page/roles-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';

export const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'visor-documento/:id',
    component: DocumentViewerPageComponent,
    canActivate: [authGuard, permissionGuard],
    data: {
      permissions: ['REPOSITORIO.VER', 'DOCUMENTO.SUBIR', 'DOCUMENTO.PUBLICAR']
    }
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'panel'
      },
      {
        path: 'panel',
        component: DashboardHomeComponent,
        data: {
          title: 'Panel administrativo',
          description: 'Resumen general del repositorio segun tu perfil.'
        }
      },
      {
        path: 'repositorio',
        component: ListaDocumentosComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Repositorio academico',
          description: 'Consulta y filtra los documentos disponibles en la plataforma.',
          permission: 'REPOSITORIO.VER'
        }
      },
      {
        path: 'historial-biblioteca',
        component: HistoryPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Historial de biblioteca',
          description: 'Consulta tus favoritos, documentos vistos, descargas y recomendaciones.',
          permissions: ['REPOSITORIO.VER', 'DOCUMENTO.SUBIR', 'DOCUMENTO.PUBLICAR']
        }
      },
      {
        path: 'subir-documento',
        component: SubirDocumentoComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Subir documento',
          description: 'Registra tesis, monografias, articulos y otros documentos academicos.',
          permission: 'DOCUMENTO.SUBIR'
        }
      },
      {
        path: 'revision-documental',
        component: ReviewDocumentsPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Revision documental',
          description: 'Publica o rechaza documentos pendientes de publicacion.',
          permission: 'DOCUMENTO.PUBLICAR'
        }
      },
      {
        path: 'edicion-documental',
        component: EditDocumentsPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Edicion documental',
          description: 'Consulta documentos publicados o historicos y actualiza su configuracion.',
          permission: 'DOCUMENTO.PUBLICAR'
        }
      },
      {
        path: 'tipos-documento',
        component: CrearTipoDocumentoComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Tipos de documento',
          description: 'Administra el catalogo de tipos usado al registrar documentos.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'areas-conocimiento',
        component: CrearAreaConocimientoComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Areas de conocimiento',
          description: 'Administra el catalogo de areas academicas del sistema.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'lineas-investigacion',
        component: CrearLineaInvestigacionComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Lineas de investigacion',
          description: 'Administra el catalogo de lineas de investigacion academica.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'sublineas-investigacion',
        component: CrearSublineaInvestigacionComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Sublineas de investigacion',
          description: 'Administra sublineas asociadas a cada linea de investigacion.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'carreras',
        component: CrearCarreraComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Carreras',
          description: 'Administra carreras asociadas a areas de conocimiento.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'carrera-lineas-investigacion',
        component: CarreraLineasInvestigacionComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Lineas por carrera',
          description: 'Asocia lineas de investigacion a cada carrera academica.',
          permission: 'CATALOGO.GESTIONAR'
        }
      },
      {
        path: 'catalogo-roles',
        component: RoleCatalogPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Roles',
          description: 'Administra el catalogo de roles disponibles en la plataforma.',
          permission: 'ROL.GESTIONAR'
        }
      },
      {
        path: 'usuarios',
        component: UsersPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Usuarios',
          description: 'Crea usuarios y actualiza los roles asignados en la plataforma.',
          permission: 'USUARIO.GESTIONAR'
        }
      },
      {
        path: 'roles',
        component: RolesPageComponent,
        canActivate: [permissionGuard],
        data: {
          title: 'Roles y permisos',
          description: 'Define roles del sistema y los permisos que habilitan cada pantalla.',
          permission: 'ROL.GESTIONAR'
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
