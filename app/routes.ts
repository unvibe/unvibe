import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  layout('routes/layout.tsx', [
    layout('routes/(home)/layout.tsx', [
      index('routes/(home)/page.tsx'),
      route('/home/docs', 'routes/(home)/home/docs/page.tsx'),
      route('/home/environment', 'routes/(home)/home/environment/page.tsx'),
      route('/home/plugins', 'routes/(home)/home/plugins/page.tsx'),
      route('/home/projects', 'routes/(home)/home/projects/page.tsx'),
      route('/home/themes', 'routes/(home)/home/themes/page.tsx'),
    ]),
    layout('routes/projects/[project_id]/layout.tsx', [
      // project home
      route('/projects/:project_id', 'routes/projects/[project_id]/page.tsx'),
      // threads
      route(
        '/projects/:project_id/threads',
        'routes/projects/[project_id]/(threads)/threads/page.tsx'
      ),
      route(
        '/projects/:project_id/threads/:id',
        'routes/projects/[project_id]/(threads)/threads/[id]/page.tsx'
      ),
      route(
        '/projects/:project_id/archive',
        'routes/projects/[project_id]/(threads)/archive/page.tsx'
      ),
      route(
        '/projects/:project_id/archive/:id',
        'routes/projects/[project_id]/(threads)/archive/[id]/page.tsx'
      ),
      // files mode
      route(
        '/projects/:project_id/files',
        'routes/projects/[project_id]/files/page.tsx'
      ),
      route(
        '/projects/:project_id/files/:encoded',
        'routes/projects/[project_id]/files/[encoded]/page.tsx'
      ),
      // visual mode
      route(
        '/projects/:project_id/visual',
        'routes/projects/[project_id]/visual/page.tsx'
      ),
      // plugins
      route(
        '/projects/:project_id/plugins',
        'routes/projects/[project_id]/plugins/page.tsx'
      ),
    ]),
    route('/demos/bmi-calculator', 'routes/demos/bmi-calculator/page.tsx'),
    route(
      '/demos/connections-graph',
      'routes/demos/connections-graph/page.tsx'
    ),
    route('/demos/file-upload', 'routes/demos/file-upload/page.tsx'),
    route('/demos/profile', 'routes/demos/profile/page.tsx'),
    route('/demos/shader-art', 'routes/demos/shader-art/page.tsx'),
    route('/demos/three-car-racer', 'routes/demos/three-car-racer/page.tsx'),
    route('/demos/three-cityscape', 'routes/demos/three-cityscape/page.tsx'),
    route('/demos/three-demo', 'routes/demos/three-demo/page.tsx'),
    route('/demos/todo', 'routes/demos/todo/page.tsx'),
    route('/demos/ui', 'routes/demos/ui/page.tsx'),
  ]),
] satisfies RouteConfig;
