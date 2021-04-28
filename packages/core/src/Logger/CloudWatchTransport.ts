/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import TransportStream, { TransportStreamOptions } from 'winston-transport';
import { LogEntry } from 'winston';
import { AWSCloudWatchProvider } from '../Providers';
import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

export interface CloudWatchTransportProps {
	name: string;
	region: string;
	logGroupName: string;
	logStreamName: string;
}

type CloudWatchTransportParams = CloudWatchTransportProps & TransportStreamOptions

/**
 * Write logs to CloudWatch
 * @class CloudWatchTransport
 */
export class CloudWatchTransport extends TransportStream {
	name: string;
	region: string;
	logEvents: InputLogEvent[];
	logGroupName: string;
	logStreamName: string;
	cloudWatch: AWSCloudWatchProvider;

	constructor(params: CloudWatchTransportParams) {
		super(params);

		const { name, region, logGroupName, logStreamName } = params;
		this.name = name;
		this.region = region;
		this.logEvents = [];
		this.logGroupName = logGroupName;
		this.logStreamName = logStreamName;

		this._initCloudWatchClient();
	}

	private _initCloudWatchClient(): void {
		this.cloudWatch = new AWSCloudWatchProvider({ region: this.region });
	}

	private _formatLog(log: LogEntry): string {
		return `[${log.level}]: ${log.message}`;
	}

	private _addToLogQueue(log: LogEntry): void {
		const formattedLog = this._formatLog(log);
		this.logEvents.push({
			message: formattedLog,
			timestamp: Date.now(),
		});
	}

	public log(log): void {
		this._addToLogQueue(log);
		this.submit();
	}

	public submit(): void {
		this.cloudWatch.pushLogs({
			logEvents: this.logEvents,
			logGroupName: this.logGroupName,
			logStreamName: this.logStreamName,
		});
	}
}
