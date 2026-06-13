# Capability: ekart-delivery

## Purpose
This capability documents the requirements and endpoints of the official Ekart API specification (`ekart-spec.yaml`) for future reference, compliance checks, and integration updates.

## Requirements

### Requirement: Authentication Token Exchange
The system SHALL support fetching Bearer access tokens via POST `/integrations/v2/auth/token/{client_id}` using a valid username and password payload.

#### Scenario: Successful access token retrieval
- **WHEN** the system requests a token with valid client credentials
- **THEN** it receives a JSON response containing an access_token, expires_in duration, and token_type "Bearer"

### Requirement: Shipment Creation
The system SHALL support creating forward or reverse package shipments via PUT `/api/v1/package/create` matching the defined shipment schema including tax values, invoice numbers, consignee details, and pickup/drop/return locations.

#### Scenario: Successful shipment booking
- **WHEN** a client submits a complete shipment payload to the package creation endpoint
- **THEN** the API returns status true, a valid tracking ID, and barcodes information

### Requirement: Shipment Cancellation
The system SHALL support canceling package shipments via DELETE `/api/v1/package/cancel` using the unique tracking ID.

#### Scenario: Successful package cancellation
- **WHEN** a cancel request is made with a valid tracking ID query parameter
- **THEN** the system receives an acknowledgement indicating the package has been canceled

### Requirement: Delayed Dispatch Date Setup
The system SHALL support setting or updating a preferred dispatch date in YYYY-MM-DD format for delayed dispatch packages via POST `/data/shipment/dispatch-date`.

#### Scenario: Updating preferred dispatch date
- **WHEN** a client sends a list of shipment IDs and a dispatch date to the dispatch-date endpoint
- **THEN** the system updates the dispatch date and returns a confirmation response

### Requirement: EWBN Code Update
The system SHALL support updating the 12-digit numeric Waybill Number (EWBN) for a package via POST `/data/shipment/ewbn`.

#### Scenario: Updating EWBN number
- **WHEN** a client submits the shipment ID and the new EWBN string
- **THEN** the system returns an acknowledgement status indicating success

### Requirement: Packing Label Retrieval
The system SHALL support downloading packing labels in PDF (binary) format or fetching their JSON definitions via POST `/api/v1/package/label` using a list of waybill IDs.

#### Scenario: Fetching label data
- **WHEN** a label download request is sent with a list of waybill IDs
- **THEN** the system returns the PDF stream or the equivalent JSON data

### Requirement: Manifest Retrieval
The system SHALL support generating and downloading manifests for shipments via POST `/data/v2/generate/manifest` using a list of waybills.

#### Scenario: Downloading manifests
- **WHEN** a manifest request is submitted with a list of waybills
- **THEN** the system returns a manifest PDF or structured manifest response

### Requirement: NDR Actions Integration
The system SHALL support submitting corrective actions for Non-Delivered Shipments (NDR) via POST `/api/v2/package/ndr`.

#### Scenario: Sending NDR instructions
- **WHEN** a client submits NDR data containing the tracking ID, event status code, and corrective instruction action
- **THEN** the system logs the action and returns a success status

### Requirement: Basic Shipment Tracking V1
The system SHALL support tracking the shipment status using the tracking ID via GET `/api/v1/track/{id}`.

#### Scenario: Retrieving tracking status details
- **WHEN** a request is made to the V1 tracking endpoint with a tracking ID
- **THEN** the system returns the status description, milestones, and timestamps

### Requirement: Elite Raw Shipment Tracking
The system SHALL support retrieving comprehensive tracking history logs, merchant name, estimated slots, and receiver relations via GET `/data/v1/elite/track/{wbn}`.

#### Scenario: Fetching elite tracking logs
- **WHEN** a query is made with a waybill number to the elite tracking endpoint
- **THEN** the system returns the nested history event array, receiver notes, sender/customer locations, and item listings

### Requirement: Pincode Serviceability Check V2
The system SHALL support querying serviceability and Cash-on-Delivery (COD) status of a single destination pincode via GET `/api/v2/serviceability/{pincode}`.

#### Scenario: Validating single pincode serviceability
- **WHEN** a check is requested for a specific pincode
- **THEN** the system returns a boolean status indicating whether the pincode is serviceable along with support details

### Requirement: Partner Route Serviceability V3
The system SHALL support querying available courier routing options and partner pricing details via POST `/data/v3/serviceability` using pickup and drop pincodes.

#### Scenario: Checking route courier details
- **WHEN** a request is made with pickup and drop pincodes
- **THEN** the system returns an array of matching courier partners and estimated rates

### Requirement: Bulk Pincode Serviceability Check
The system SHALL support downloading the full database of serviceable pincodes in JSON or Excel format via GET `/data/serviceability/bulk/{type}` where type is NON_LARGE or LARGE.

#### Scenario: Fetching bulk pincode list
- **WHEN** a bulk request is sent with the serviceability type parameter
- **THEN** the system returns the bulk serviceability dataset in the requested format

### Requirement: Address Registration
The system SHALL support registering warehouse pickup or Return-to-Origin (RTO) address locations via POST `/api/v2/address`.

#### Scenario: Adding a warehouse location address
- **WHEN** a location payload with a unique name alias, contact info, and address structure is submitted
- **THEN** the system registers the address and returns a success response

### Requirement: Webhook Configuration Management
The system SHALL support managing tracking and delivery webhook endpoints via POST `/api/v2/webhook/add`, PUT `/api/v2/webhook/edit`, and GET `/api/v2/webhook/get`.

#### Scenario: Registering a tracking webhook URL
- **WHEN** a webhook registration payload with event triggers and target URL is sent
- **THEN** the system registers the webhook and registers the webhook configuration
