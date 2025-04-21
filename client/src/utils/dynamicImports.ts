// Dynamic imports for heavy third-party libraries
export const loadFirebase = () => import('firebase/app');
export const loadFirestore = () => import('firebase/firestore');
export const loadAuth = () => import('firebase/auth');
export const loadStorage = () => import('firebase/storage');

// Utility function to load multiple Firebase services
export const loadFirebaseServices = async () => {
  const [firebase, firestore, auth, storage] = await Promise.all([
    loadFirebase(),
    loadFirestore(),
    loadAuth(),
    loadStorage(),
  ]);
  
  return {
    firebase: firebase.default,
    firestore: firestore.default,
    auth: auth.default,
    storage: storage.default,
  };
};

// Dynamic imports for other heavy libraries
export const loadChartLibrary = () => import('chart.js/auto');
export const loadPDFLibrary = () => import('pdfjs-dist');
export const loadExcelLibrary = () => import('xlsx');

// Utility function to load data visualization libraries
export const loadDataVizLibraries = async () => {
  const [chart] = await Promise.all([
    loadChartLibrary(),
  ]);
  
  return {
    chart: chart,
  };
};

// Utility function to load document processing libraries
export const loadDocumentLibraries = async () => {
  const [pdf, excel] = await Promise.all([
    loadPDFLibrary(),
    loadExcelLibrary(),
  ]);
  
  return {
    pdf: pdf.default,
    excel: excel.default,
  };
}; 