// route: /profile/$id/picture

import { Route } from './router';

export enum ParsedPathSegmentType {
  REGULAR,
  PARAMTER,
}

export type ParsedPathSegment = {
  type: ParsedPathSegmentType;
  path: string;
};

/* 

'/path': {
  '/to': {

  },
}

*/

export type ParsedRouteTree = {
  path: string;
  type: ParsedPathSegment;
  children: {
    [key: string]: ParsedRouteTree;
  };
};

export const flattenRoutes = (routes: Route[], root: string): Route[] =>
  routes.flatMap((route) => {
    if (route.children) {
      return flattenRoutes(route.children, `${root}/${route.path}`);
    }

    return [route];
  });

export const parseRoute = (route: string) => {
  let trimmedRoute = route;
  if (route.startsWith('/')) {
    trimmedRoute = route.slice(1);
  }

  const segments = trimmedRoute.split('/');
  const parsedSegments = segments.map<ParsedPathSegment>((segment) => {
    if (segment.startsWith('$')) {
      return {
        type: ParsedPathSegmentType.PARAMTER,
        path: segment.slice(1),
      };
    } else {
      return {
        type: ParsedPathSegmentType.REGULAR,
        path: segment,
      };
    }
  });

  return parsedSegments;
};
