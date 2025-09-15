import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      dbId: string;
      email: string;
      name: string;
      role: string;
      studentNumber?: string;
      section?: string;
      createdAt: Date;
      updatedAt: Date;
      hasCompletedProfile: boolean;
      hasMemberApplication: boolean;
      memberApplication?: {id: string; hasAccepted: boolean; paymentProof?: string; createdAt: Date};
      hasEAApplication: boolean;
      eaApplication?: {id: string; hasAccepted: boolean; status: string};
      hasCommitteeApplication: boolean;
      committeeApplication?: {id: string; hasAccepted: boolean; status: string};
      applicationStatus: {
        member: {
          hasApplication: boolean;
          hasPayment?: boolean;
          isAccepted?: boolean;
          appliedAt?: Date;
        };
        ea: {
          hasApplication: boolean;
          status?: string;
          isAccepted?: boolean;
        };
        committee: {
          hasApplication: boolean;
          status?: string;
          isAccepted?: boolean;
        };
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }

  interface JWT {
    id: string;
    role: string;
  }
}
