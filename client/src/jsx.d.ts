declare module '@/pages/*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module '@/components/*/*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}