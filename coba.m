clc;
clear;
clear all;
close all;
%% ===============Relays Data=============== %%
warningstatus=zeros(1,1);
fprintf('=====Perhitungan Time Dial Setting Menggunakan
Modified Particle Swarm Optimization=====\n');
maxpart=(input('Masukkan Jumlah Relay : '));
kVbase=input('Masukkan kV Base : ');
fprintf('\n');
nRelay=2;
fprintf('========== Input Data Relay 1 dan 2 ==========\n');
kV=input('Masukkan Tegangan Relay 1 dan 2 (kV) : ');
CT=input('Masukkan Primer CT Relay 1 dan 2 : ');
FLA=input('Masukkan FLA Relay 1 dan 2 (A) : ');
Iscmax_prim=input('Masukkan Iscmax Primer 1 dan 2 (A) : ');
Iscmax_back=input('Masukkan Iscmax Backup 1 dan 2 (A) : ');
relay_primary_backup=[1 2];
Target_TopMin=input('Target Top Minimum (s) : ');
Target_TopMax=input('Target Top Maksimum (s) : ');
fprintf('Jenis Kurva :\n');
fprintf('(1) Standard Inverse\n');
fprintf('(2) Very Inverse\n');
fprintf('(3) Long Time Inverse\n');
fprintf('(4) Extremely Inverse\n');
fprintf('(5) Ultra Inverse\n');
% Selecting the Curve Type
CurveType=input('Pilih Jenis Kurva : ');
for j=1:nRelay
if CurveType(j)==1
coef_k(j)=0.14;
coef_alpha(j)=0.02;
coef_beta(j)=2.97;
else if CurveType(j)==2
coef_k(j)=13.5;
coef_alpha(j)=1;
coef_beta(j)=1.5;
else if CurveType(j)==3
coef_k(j)=120;
coef_alpha(j)=1;
coef_beta(j)=13.33;
else if CurveType(j)==4
coef_k(j)=80;
coef_alpha(j)=2;
coef_beta(j)=0.808;
else if CurveType(j)==5
coef_k(j)=315.2;
coef_alpha(j)=2.5;
coef_beta(j)=1;
end
end
end
end
end
end
% Target CTI
Target_CTI=input('Target CTI (s) : ');
% Make to the base value
for j=1:nRelay
FLA_relay(1,j)=((FLA(j)*kV(j))/kVbase);
end
for j=1:nRelay
Ip(j)=1.05*FLA_relay(j);
end
for j=1:nRelay
Iscmax_primer(1,j)=((Iscmax_prim(j)*kV(j))/kVbase);
Iscmax_backup(1,j)=((Iscmax_back(j)*kV(j))/kVbase);
end
main_relay=size(relay_primary_backup);
main_backup_pair=main_relay(1); %Number Pair of Relay
RelaySize=[1 nRelay]; % Matrix Size of Number
of Relays
TDSmin=0.1; % Lower Bound of TDS
TDSmax=12.5; % Upper Bound of TDS
stepTDS=0.01; % Step TDS of the Relay
% Define The Saturation Area
for j=1:nRelay
ipsat=20; %Saturation Tap
ConstantSat(j)=((coef_k(j)/coef_beta(j))*1)/((((ipsat/1))^co
ef_alpha(j))-1);
end
%% ===============Parameters of PSO===============%%
MaxIt=50; % Maximum Number of
Iterations
nPop=10; % Population Size
wmax=0.9; % Inertia Constants
wmin=0.4;
c1=0.5;
c2=0.5;
c3min=0.4;
c3max=0.6;
MaxvTDS=0.2*(TDSmax-TDSmin);
MinvTDS=-MaxvTDS;
%% ===============Initialization of PSO===============%%
%c3 template
empty.coef3=[];
coeficient3=repmat(empty, MaxIt, 1);
selisih=(c3max-c3min)/MaxIt;
coeficient3(1).coef3=0.4;
% The Particle Template
empty_Particle.xTDS=[];
empty_Particle.vTDS=[];
empty_Particle.TimeOperationPrim=[];
empty_Particle.TimeOperationSek=[];
empty_Particle.Cost=[];
empty_Particle.Best.xTDS=[];
empty_Particle.Best.TimeOperationPrim=[];
empty_Particle.Best.TimeOperationSek=[];
empty_Particle.Best.Cost=[];
% Create Population Array
Particle=repmat(empty_Particle, nPop, 1);
% Initialize Population Members
for i=1:nPop
% Generate Random Solution of TDS
Particle(i).xTDS=ceil(unifrnd(TDSmin,TDSmax,RelaySize)*(1/st
epTDS))/(1/stepTDS);
% Initialize vTDS
Particle(i).vTDS=0.1*Particle(i).xTDS;
end
% Array to Hold Initial Random Solution of TDS
for i=1:nPop
for j=1:nRelay
SaveTDS_initial(i,j)=Particle(i).xTDS(j);
end
end
for i=1:nPop
SaveTDS_initial2(1,i)=Particle(i).xTDS(1);
end
for i=1:nPop
SaveTDS_initial2(1,i+nPop)=Particle(i).xTDS(2);
end
% Time Operation Calculation
for i=1:nPop
for j=1:main_backup_pair
if Iscmax_primer(j)>20*Ip(j) &&
Iscmax_backup(j+1)>20*Ip(j+1)
for k=j:nRelay
Particle(i).TimeOperationPrim(k)=ConstantSat(k)*Particle(i).
xTDS(k);
end
for l=j:main_backup_pair
Particle(i).TimeOperationSek(l+1)=Particle(i).TimeOperationP
rim(l+1);
end
else if Iscmax_primer(j)>20*Ip(j) &&
Iscmax_backup(j+1)<20*Ip(j+1)
for k=j:nRelay
Particle(i).TimeOperationPrim(k)=ConstantSat(k)*Particle(i).
xTDS(k);
Particle(i).TimeOperationSek(k)=((coef_k(k)/coef_beta(k))*(P
article(i).xTDS(k)))/(((Iscmax_backup(1,k)/(Ip(1,k)))^coef_a
lpha(k))-1);
end
else if Iscmax_primer(j)<20*Ip(j) &&
Iscmax_backup(j+1)<20*Ip(j+1)
for k=j:nRelay
Particle(i).TimeOperationPrim(k)=((coef_k(k)/coef_beta(k))*(
Particle(i).xTDS(k)))/(((Iscmax_primer(1,k)/(Ip(1,k)))^coef_
alpha(k))-1);
Particle(i).TimeOperationSek(k)=((coef_k(k)/coef_beta(k))*(P
article(i).xTDS(k)))/(((Iscmax_backup(1,k)/Ip(1,k))^coef_alp
ha(k))-1);
end
end
end
end
end
if j==main_backup_pair
for t=j+1
if Iscmax_primer(t)>20*Ip(t)
Particle(i).TimeOperationPrim(t)=ConstantSat(t)*Particle(i).
xTDS(t);
else if Iscmax_primer(t)<20*Ip(t)
Particle(i).TimeOperationPrim(t)=((coef_k(t)/coef_beta(t))*(
Particle(i).xTDS(t)))/(((Iscmax_primer(1,t)/((Ip(1,t))))^coe
f_alpha(t))-1);
end
end
end
end
end
% Array to Hold Initial Top
for i=1:nPop
for j=1:nRelay
SaveTopPrim_initial(i,j)=Particle(i).TimeOperationPrim(j);
SaveTopBack_initial(i,j)=Particle(i).TimeOperationSek(j);
end
end
% Constrain Top>0.1
for i=1:nPop
for j=1:nRelay
while Particle(i).TimeOperationPrim(j)<Target_TopMin
if TDSmin<=TDSmax
TDSmin=TDSmin+stepTDS;
Particle(i).xTDS(j)=ceil((((TDSmax-
TDSmin)*rand)+TDSmin)*1/stepTDS)/(1/stepTDS);
for k=1:main_backup_pair
if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)>20*Ip(k+1)
for l=j:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
end
for m=j:main_backup_pair
Particle(i).TimeOperationSek(m+1)=Particle(i).TimeOperationP
rim(m+1);
end
else if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
else if Iscmax_primer(k)<20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=((coef_k(l)/coef_beta(l))*(
Particle(i).xTDS(l)))/(((Iscmax_primer(1,l)/(Ip(1,l)))^coef_
alpha(l))-1);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
end
end
end
end
if k==main_backup_pair
for t=k+1
if Iscmax_primer(t)>20*Ip(t)
Particle(i).TimeOperationPrim(t)=ConstantSat(t)*Particle(i).
xTDS(t);
else if Iscmax_primer(t)<20*Ip(t)
Particle(i).TimeOperationPrim(t)=((coef_k(t)/coef_beta(t))*(
Particle(i).xTDS(t)))/(((Iscmax_primer(1,t)/(Ip(1,t)))^coef_
alpha(t))-1);
end
end
end
end
else break
end
end
while Particle(i).TimeOperationPrim(j)>Target_TopMax
if TDSmax>=TDSmin
TDSmax=TDSmax-stepTDS;
Particle(i).xTDS(j)=ceil((((TDSmax-
TDSmin)*rand)+TDSmin)*1/stepTDS)/(1/stepTDS);
for k=1:main_backup_pair
if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)>20*Ip(k+1)
for l=j:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
end
for m=j:main_backup_pair
Particle(i).TimeOperationSek(m+1)=Particle(i).TimeOperationP
rim(m+1);
end
else if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
else if Iscmax_primer(k)<20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=((coef_k(l)/coef_beta(l))*(
Particle(i).xTDS(l)))/(((Iscmax_primer(1,l)/(Ip(1,l)))^coef_
alpha(l))-1);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
end
end
end
end
if k==main_backup_pair
for t=k+1
if Iscmax_primer(t)>20*Ip(t)
Particle(i).TimeOperationPrim(t)=ConstantSat(t)*Particle(i).
xTDS(t);
else if Iscmax_primer(t)<20*Ip(t)
Particle(i).TimeOperationPrim(t)=((coef_k(t)/coef_beta(t))*(
Particle(i).xTDS(t)))/(((Iscmax_primer(1,t)/(Ip(1,t)))^coef_
alpha(t))-1);
end
end
end
end
else break
end
end
end
end
for i=1:nPop
Particle(i).vTDS=0.1*Particle(i).xTDS;
end
% CTI Calculation
for i=1:nPop
for j=1:main_backup_pair
CTI(i,j)=Particle(i).TimeOperationSek(relay_primary_backup(j
,2))-
Particle(i).TimeOperationPrim(relay_primary_backup(j,1));
end
end
% Objective Function
for i=1:nPop
Particle(i).Cost=sum(Particle(i).TimeOperationPrim);
end
% Update The Personal Best
for i=1:nPop
for j=1:nRelay
Particle(i).Best.xTDS(j)=Particle(i).xTDS(j);
Particle(i).Best.TimeOperationPrim(j)=Particle(i).TimeOperat
ionPrim(j);
Particle(i).Best.TimeOperationSek(j)=Particle(i).TimeOperati
onSek(j);
end
% Initial Particle Best Cost
Particle(i).Best.Cost=100;
end
GlobalBest.Cost=inf;
% Update The Global Best
for i=1:nPop
if Particle(i).Best.Cost<GlobalBest.Cost
GlobalBest=Particle(i).Best;
end
end
%Lineary Increased c3
for it = 2 : MaxIt
coeficient3(it).coef3=coeficient3(it-1).coef3+selisih;
end
% Array to Hold Initial Random Solution of Velocity
vTDS_initial=[];
for i=1:nPop
for j=1:nRelay
vTDS_initial(i,j)=Particle(i).vTDS(j);
end
end
% Array to Hold Best Cost Value on Each Iteration
BestCosts=zeros(MaxIt,1);
%% =============== Main Loop of PSO ===============%%
TDSmax=12.5;
TDSmin=0.1;
for it=1:MaxIt
for i=1:nPop
for j=1:nRelay
% Update c3
c3(it)=coeficient3(it).coef3;
% Update R
R=Particle(randi([1 nPop],1,1)).xTDS;
% Update Damping Coefficients
w=wmax-((wmax-wmin).*(it/MaxIt));
% Update vTDS
Particle(i).vTDS(j)=w*Particle(i).vTDS(j)...
+c1*rand.*(Particle(i).Best.xTDS(j) -
Particle(i).xTDS(j))...
+c2*rand.*(GlobalBest.xTDS(j) -
Particle(i).xTDS(j))...
+c3(it).*rand.*(R(j)-Particle(i).xTDS(j));
% Apply vTDS Limits
Particle(i).vTDS=max(Particle(i).vTDS,MinvTDS);
Particle(i).vTDS=min(Particle(i).vTDS,MaxvTDS);
% Update xTDS with STEP
Particle(i).xTDS(j)=ceil((Particle(i).xTDS(j)+Particle(i).vT
DS(j))*1/stepTDS)/(1/stepTDS);
xTDS(i,j)=Particle(i).xTDS(j);
% Apply Lower and Upper Bound TDS Limits
Particle(i).xTDS(j)=max(Particle(i).xTDS(j),TDSmin);
Particle(i).xTDS(j)=min(Particle(i).xTDS(j),TDSmax);
% Evaluation & Update Time Operation
for k=1:main_backup_pair
if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)>20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
end
for m=k:main_backup_pair
Particle(i).TimeOperationSek(m+1)=Particle(i).TimeOperationP
rim(m+1);
end
else if Iscmax_primer(k)>20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=ConstantSat(l)*Particle(i).
xTDS(l);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
else if Iscmax_primer(k)<20*Ip(k) &&
Iscmax_backup(k+1)<20*Ip(k+1)
for l=k:nRelay
Particle(i).TimeOperationPrim(l)=((coef_k(l)/coef_beta(l))*(
Particle(i).xTDS(l)))/(((Iscmax_primer(1,l)/(Ip(1,l)))^coef_
alpha(l))-1);
Particle(i).TimeOperationSek(l)=((coef_k(l)/coef_beta(l))*(P
article(i).xTDS(l)))/(((Iscmax_backup(1,l)/(Ip(1,l)))^coef_a
lpha(l))-1);
end
end
end
end
end
if k==main_backup_pair
for t=k+1
if Iscmax_primer(t)>20*Ip(t)
Particle(i).TimeOperationPrim(t)=ConstantSat(t)*Particle(i).
xTDS(t);
else if Iscmax_primer(t)<20*Ip(t)
Particle(i).TimeOperationPrim(t)=((coef_k(t)/coef_beta(t))*(
Particle(i).xTDS(t)))/(((Iscmax_primer(1,t)/(Ip(1,t)))^coef_
alpha(t))-1);
end
end
end
end
% Evaluation Objective Function
Particle(i).Cost=sum(Particle(i).TimeOperationPrim);
end
end
% Evaluation CTI
for i=1:nPop
for j=1:main_backup_pair
CTI(i,j)=Particle(i).TimeOperationSek(relay_primary_backup(j
,2))-
Particle(i).TimeOperationPrim(relay_primary_backup(j,1));
end
end
% Constrain Evaluation
for i=1:nPop
for j=1:nRelay
if
Particle(i).TimeOperationPrim(j)<Target_TopMin ||
Particle(i).TimeOperationPrim(j)>Target_TopMax
Particle(i).Cost=100;
end
end
end
for i=1:nPop
for j=1:main_backup_pair
if CTI(i,j)<Target_CTI
Particle(i).Cost=100;
end
end
end
% Update Personal & Global Best
for i=1:nPop
% Update Personal Best
if Particle(i).Cost<Particle(i).Best.Cost
Particle(i).Best.xTDS=Particle(i).xTDS;
Particle(i).Best.TimeOperationPrim=Particle(i).TimeOperation
Prim;
Particle(i).Best.TimeOperationSek=Particle(i).TimeOperationS
ek;
Particle(i).Best.Cost=sum(Particle(i).Best.TimeOperationPrim
);
end
end
for i=1:nPop
% Update Global Best
if Particle(i).Best.Cost<GlobalBest.Cost
GlobalBest=Particle(i).Best;
GlobalBest.TimeOperationSek(1)=0;
end
endj
% Store The Best Cost Value
BestCosts(it)=GlobalBest.Cost;