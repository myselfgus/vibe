import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
	imageUrl: string;
	intensity?: number;
	speed?: number;
}

export function AnimatedBackground({
	imageUrl,
	intensity = 0.15,
	speed = 0.0005
}: AnimatedBackgroundProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationFrameRef = useRef<number | undefined>(undefined);
	const startTimeRef = useRef<number>(Date.now());
	const imageRef = useRef<HTMLImageElement | undefined>(undefined);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext('webgl', {
			alpha: true,
			premultipliedAlpha: false,
			antialias: true
		});

		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		const vertexShaderSource = `
			attribute vec2 a_position;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;

			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				v_texCoord = a_texCoord;
			}
		`;

		const fragmentShaderSource = `
			precision mediump float;

			uniform sampler2D u_image;
			uniform float u_time;
			uniform float u_intensity;
			uniform vec2 u_resolution;

			varying vec2 v_texCoord;

			// Simplex noise function
			vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

			float snoise(vec2 v) {
				const vec4 C = vec4(0.211324865405187, 0.366025403784439,
						   -0.577350269189626, 0.024390243902439);
				vec2 i  = floor(v + dot(v, C.yy) );
				vec2 x0 = v -   i + dot(i, C.xx);
				vec2 i1;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;
				i = mod(i, 289.0);
				vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
					+ i.x + vec3(0.0, i1.x, 1.0 ));
				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
					dot(x12.zw,x12.zw)), 0.0);
				m = m*m ;
				m = m*m ;
				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;
				m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;
				return 130.0 * dot(m, g);
			}

			void main() {
				vec2 uv = v_texCoord;

				// Create flowing distortion
				float noise1 = snoise(uv * 3.0 + u_time * 0.3);
				float noise2 = snoise(uv * 5.0 - u_time * 0.2);
				float noise3 = snoise(uv * 7.0 + u_time * 0.15);

				// Combine noise layers for organic movement
				vec2 distortion = vec2(noise1, noise2) * u_intensity;
				distortion += vec2(noise3) * u_intensity * 0.5;

				// Apply distortion to UV coordinates
				vec2 distortedUV = uv + distortion;

				// Sample texture with distortion
				vec4 color = texture2D(u_image, distortedUV);

				// Add subtle shimmer effect
				float shimmer = snoise(uv * 10.0 + u_time) * 0.05 + 0.95;
				color.rgb *= shimmer;

				// Fade edges for seamless blending
				float vignette = smoothstep(0.0, 0.3, uv.x) *
								smoothstep(1.0, 0.7, uv.x) *
								smoothstep(0.0, 0.3, uv.y) *
								smoothstep(1.0, 0.7, uv.y);

				color.a *= vignette * 0.4;

				gl_FragColor = color;
			}
		`;

		function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
			const shader = gl.createShader(type);
			if (!shader) return null;

			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}

			return shader;
		}

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

		if (!vertexShader || !fragmentShader) return;

		const program = gl.createProgram();
		if (!program) return;

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program linking error:', gl.getProgramInfoLog(program));
			return;
		}

		const positionLocation = gl.getAttribLocation(program, 'a_position');
		const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
		const imageLocation = gl.getUniformLocation(program, 'u_image');
		const timeLocation = gl.getUniformLocation(program, 'u_time');
		const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
		const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			 1, -1,
			-1,  1,
			 1,  1,
		]), gl.STATIC_DRAW);

		const texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0, 1,
			1, 1,
			0, 0,
			1, 0,
		]), gl.STATIC_DRAW);

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		const image = new Image();
		image.crossOrigin = 'anonymous';
		imageRef.current = image;

		image.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		};

		image.src = imageUrl;

		function resize() {
			if (!canvas) return;
			const displayWidth = window.innerWidth;
			const displayHeight = window.innerHeight;

			if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
				canvas.width = displayWidth;
				canvas.height = displayHeight;
				gl?.viewport(0, 0, displayWidth, displayHeight);
			}
		}

		function render() {
			if (!gl || !canvas) return;

			resize();

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			gl.useProgram(program);

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
			gl.enableVertexAttribArray(texCoordLocation);
			gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

			gl.uniform1i(imageLocation, 0);

			const currentTime = (Date.now() - startTimeRef.current) * speed;
			gl.uniform1f(timeLocation, currentTime);
			gl.uniform1f(intensityLocation, intensity);
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			animationFrameRef.current = requestAnimationFrame(render);
		}

		window.addEventListener('resize', resize);
		resize();
		render();

		return () => {
			window.removeEventListener('resize', resize);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
			gl.deleteBuffer(texCoordBuffer);
			gl.deleteTexture(texture);
		};
	}, [imageUrl, intensity, speed]);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none"
			style={{
				zIndex: 0,
				width: '100vw',
				height: '100vh'
			}}
		/>
	);
}
