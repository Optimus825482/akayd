
import React from 'react';
import type { Service } from '../types';
import { serviceIcons } from '../constants';

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const IconComponent = serviceIcons[service.iconName];

    return (
        <div className="bg-surface p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
            <div className="bg-accent-bg p-5 rounded-full mb-6">
                {IconComponent && <IconComponent className="w-10 h-10 text-accent" />}
            </div>
            <h3 className="text-xl font-bold text-ink mb-3">{service.title}</h3>
            <p className="text-ink-2 flex-grow">{service.description}</p>
        </div>
    );
};

export default ServiceCard;
