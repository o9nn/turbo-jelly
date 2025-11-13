/**
 * IoT Sensor Integration Layer
 * Handles Android sensor data fusion and context awareness
 */

import { IoTSensorData } from '../types';

export class IoTSensorFusion {
  private sensorReadings: Map<string, IoTSensorData[]>;
  private contextProviders: Map<string, (data: IoTSensorData) => any>;

  constructor() {
    this.sensorReadings = new Map();
    this.contextProviders = new Map();
    this.registerDefaultProviders();
  }

  /**
   * Register default context providers for sensor types
   */
  private registerDefaultProviders(): void {
    this.contextProviders.set('accelerometer', this.motionIntentPrediction.bind(this));
    this.contextProviders.set('gyroscope', this.orientationContext.bind(this));
    this.contextProviders.set('proximity', this.presenceAwareness.bind(this));
    this.contextProviders.set('microphone', this.conversationalContext.bind(this));
    this.contextProviders.set('camera', this.environmentalAwareness.bind(this));
    this.contextProviders.set('location', this.spatialContext.bind(this));
  }

  /**
   * Process incoming sensor data
   */
  async processSensorData(data: IoTSensorData): Promise<any> {
    // Store sensor reading
    const readings = this.sensorReadings.get(data.deviceId) || [];
    readings.push(data);
    
    // Keep only last 100 readings per device
    if (readings.length > 100) {
      readings.shift();
    }
    this.sensorReadings.set(data.deviceId, readings);

    // Apply context provider
    const provider = this.contextProviders.get(data.sensorType);
    if (provider) {
      return provider(data);
    }

    return { sensorType: data.sensorType, processed: true };
  }

  /**
   * Motion intent prediction from accelerometer
   */
  private motionIntentPrediction(data: IoTSensorData): any {
    const magnitude = Math.sqrt(
      data.values.reduce((sum, val) => sum + val * val, 0)
    );
    
    return {
      intent: magnitude > 15 ? 'active-motion' : 'stationary',
      magnitude,
      timestamp: data.timestamp,
    };
  }

  /**
   * Orientation context from gyroscope
   */
  private orientationContext(data: IoTSensorData): any {
    return {
      orientation: 'dynamic',
      rotation: data.values,
      timestamp: data.timestamp,
    };
  }

  /**
   * Presence awareness from proximity sensor
   */
  private presenceAwareness(data: IoTSensorData): any {
    return {
      presence: data.values[0] < 5 ? 'near' : 'far',
      distance: data.values[0],
      timestamp: data.timestamp,
    };
  }

  /**
   * Conversational context from microphone
   */
  private conversationalContext(data: IoTSensorData): any {
    const volume = data.values[0] || 0;
    
    return {
      activity: volume > 50 ? 'conversation' : 'quiet',
      volume,
      timestamp: data.timestamp,
    };
  }

  /**
   * Environmental awareness from camera
   */
  private environmentalAwareness(data: IoTSensorData): any {
    return {
      environment: 'visual-context',
      timestamp: data.timestamp,
    };
  }

  /**
   * Spatial context from location
   */
  private spatialContext(data: IoTSensorData): any {
    return {
      location: {
        lat: data.values[0],
        lng: data.values[1],
      },
      timestamp: data.timestamp,
    };
  }

  /**
   * Get fused context from multiple sensors
   */
  getFusedContext(deviceId: string): any {
    const readings = this.sensorReadings.get(deviceId) || [];
    const contexts: any = {};

    // Process last reading of each sensor type
    const latestBySensor = new Map<string, IoTSensorData>();
    readings.forEach(reading => {
      latestBySensor.set(reading.sensorType, reading);
    });

    latestBySensor.forEach((reading, sensorType) => {
      const provider = this.contextProviders.get(sensorType);
      if (provider) {
        contexts[sensorType] = provider(reading);
      }
    });

    return contexts;
  }

  /**
   * Clear sensor readings
   */
  clear(deviceId?: string): void {
    if (deviceId) {
      this.sensorReadings.delete(deviceId);
    } else {
      this.sensorReadings.clear();
    }
  }
}
