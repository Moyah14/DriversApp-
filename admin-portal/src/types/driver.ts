export interface DriverType {
    id: number | string;
    name: string;
    phone: string;
    address: string;
    nin: string;
    license: string;
    dateRegistered: string;
    registeredBy: string;
    status: "Active" | "Suspended";
    cardBalance: string;
    vehicle: {
      plateNumber: string;
      type: string;
      route: string;
      park: string;
    };
    licenseFile: {
      name: string;
      size: string;
      url: string;
    };
  }