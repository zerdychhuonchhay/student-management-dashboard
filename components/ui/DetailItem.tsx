
import React from 'react';

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | number | undefined | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {icon} {label}
        </dt>
        <dd className="mt-1 text-md text-gray-900">{value || 'N/A'}</dd>
    </div>
);

export default DetailItem;
