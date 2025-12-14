"use client";

//manager view for displaying tenants, leases, and payment status for a single property

import ContentHeader from "@/components/ContentHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { ArrowDownToLine, ArrowLeft, Check, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const ManagerPropertyTenants = () => {
  //extracts property id from route params
  const { id } = useParams();
  const numericPropertyId = Number(id);

  //fetches property details for header display
  const { data: propertyData, isLoading: isPropertyLoading } =
    useGetPropertyQuery(numericPropertyId);

  //fetches all leases associated with this property
  const { data: propertyLeases, isLoading: isLeasesLoading } =
    useGetPropertyLeasesQuery(numericPropertyId);

  //fetches payment history for all leases on this property
  const { data: propertyPayments, isLoading: isPaymentsLoading } =
    useGetPaymentsQuery(numericPropertyId);

  //shows loading spinner until all required data is available
  if (isPropertyLoading || isLeasesLoading || isPaymentsLoading)
    return <LoadingSpinner />;

  //determines payment status for the current month for a given lease
  const fetchCurrentMonthPaymentStatus = (leaseId: number) => {
    const currentDate = new Date();

    const currentMonthPayment = propertyPayments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );

    return currentMonthPayment?.paymentStatus || "Not Paid";
  };

  return (
    <div className="dashboard-container">
      {/* navigation back to manager properties list */}
      <Link
        href="/managers/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Return to Properties</span>
      </Link>

      {/* property title and page context */}
      <ContentHeader
        title={propertyData?.name || "My Property"}
        subtitle="Manage tenants and leases for this property"
      />

      <div className="w-full space-y-6">
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          {/* table header and bulk actions */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Tenants Overview</h2>
              <p className="text-sm text-gray-500">
                View and handle all residents of this property
              </p>
            </div>
            <div>
              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2
              px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Download All</span>
              </button>
            </div>
          </div>

          <hr className="mt-4 mb-1" />

          {/* responsive table for lease and tenant data */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Current Month Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyLeases?.map((lease) => (
                  <TableRow key={lease.id} className="h-24">
                    {/* tenant identity and contact info */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={lease.tenant.photoUrl || "/landing-i1.png"}
                          alt={lease.tenant.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold">
                            {lease.tenant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lease.tenant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* lease start and end dates */}
                    <TableCell>
                      <div>
                        {new Date(lease.startDate).toLocaleDateString()} -
                      </div>
                      <div>{new Date(lease.endDate).toLocaleDateString()}</div>
                    </TableCell>

                    {/* agreed monthly rent */}
                    <TableCell>${lease.rent.toFixed(2)}</TableCell>

                    {/* computed payment status for current month */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          fetchCurrentMonthPaymentStatus(lease.id) === "Paid"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {fetchCurrentMonthPaymentStatus(lease.id) === "Paid" && (
                          <Check className="w-4 h-4 inline-block mr-1" />
                        )}
                        {fetchCurrentMonthPaymentStatus(lease.id)}
                      </span>
                    </TableCell>

                    {/* tenant phone number */}
                    <TableCell>{lease.tenant.phoneNumber}</TableCell>

                    {/* lease document download action */}
                    <TableCell>
                      <button
                        className={`border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex 
                      items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50`}
                      >
                        <ArrowDownToLine className="w-4 h-4 mr-1" />
                        Download Agreement
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPropertyTenants;
