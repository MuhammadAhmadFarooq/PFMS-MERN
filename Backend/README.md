# Web Engineering PFMS Project

This is my web engineering project of PFMS, which focuses on managing poultry farming operations efficiently. The project includes several modules to streamline various aspects of poultry management.

## Modules and Functionalities

### 1. Feed Inventory Management

- Track feed stocks with quantity and usage records.
- Manage feed orders, including date and supplier details.
- Monitor daily usage of feed to ensure stock availability.

### 2. Health Management

- Schedule vaccination dates for flocks.
- Maintain records of all previous vaccinations, including vaccine type and administration date.
- Track mortality of hens.

### 3. Egg Production Tracking

- Monitor daily egg production with date-specific logs.
- Maintain historical records for analysis and tracking.

### 4. Egg Inventory Management

- Record eggs sold with buyer details and sale dates.
- Maintain updated records of eggs in inventory.

### 5. Cost Tracking

- Track standard expenses like feed, labor, and electricity.
- Allow users to add custom expenses dynamically (e.g., plumbing).

### 6. Revenue Tracking

- Record total sales and income generated from egg sales.
- Calculate and display total expenses and profit/loss.

### 7. User Dashboard Module

- Display daily, weekly, and monthly trends for egg production, mortality, feed usage, and financial data.
- Provide a profit/loss overview with dynamically updated figures.
- Visualize data using charts and graphs, such as bar graphs for expenses and line charts for revenue trends.
- Highlight critical alerts like low feed stock, missed vaccination schedules, and high mortality rates.
- Allow filtering and customization of displayed data by time range or category (e.g., feed, revenue).

### 8. Admin Dashboard Module

- Provide administrative functionalities to manage users and oversee overall operations.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/repo.git
   ```
2. Install NPM packages
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables.

### Usage

To start the server, run:

```bash
npm run devStart
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License. See `LICENSE` for more information.
